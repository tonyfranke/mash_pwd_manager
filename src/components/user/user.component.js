import React from 'react';
import './user.component.sass';
import * as srp from 'secure-remote-password/client';
import * as axios from 'axios';
import * as crypto from 'crypto';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { connect } from 'react-redux';
import { updateUserProof, showMessage } from '../../redux/actions/index';

class User extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      mail: props.mail,
      currPassword: '',
      password: '',
      passwordMatch: ''
    }
  }

  handleChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  }

  update = async () => {

    if (this.state.mail === '') {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please type in your mail address.' });
      return;
    }

    if (!this.state.mail.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'The format of the mail is not correct.' });
      return;
    }

    if (this.state.password === '') {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please type in a password.' });
      return;
    }

    if (this.state.passwordMatch === '') {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please confirm your password.' });
      return;
    }

    if (!this.state.password.match(/^(?=.*[0-9])(?=.*[!"#$%&`()*+,-./:;<=>?@[\\\]^{|}~])(?=.*[A-Z])[a-zA-Z0-9!"#$%&`()*+,-./:;<=>?@[\\\]^{|}~]{8,}$/)) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Password is to weak.' });
      return;
    }

    if (this.state.password !== this.state.passwordMatch) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Passwords do not match.' });
      return;
    }

    try {
      // generate current verifier from current password
      const currkey = await this.generatePBKDF2Hash(this.state.currPassword, this.props.salt + this.props.username);
      const currVerifier = srp.deriveVerifier(currkey.toString('hex'));

      // generate new salt and verifier from new password
      const newSalt = srp.generateSalt();
      const newKey = await this.generatePBKDF2Hash(this.state.password, newSalt + this.props.username);
      const newVerifier = srp.deriveVerifier(newKey.toString('hex'));

      const clientEphemeral = srp.generateEphemeral()

      const responseStepOne = await axios.post(
        process.env.NODE_ENV === 'production' ? '/user/update' : 'http://localhost:4500/user/update',
        {
          step: '1',
          username: this.props.username,
          mail: this.state.mail,
          newSalt: newSalt,
          currVerifier: currVerifier,
          newVerifier: newVerifier,
          clientPublicEphemeral: clientEphemeral.public
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      console.log('res1:', responseStepOne.data);

      if (!responseStepOne || !responseStepOne.data || !responseStepOne.data.stepOneComplete) {
        this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'User data could not be updated.' });
        return;
      }

      const clientSession = srp.deriveSession(clientEphemeral.secret, responseStepOne.data.serverEphemeral, newSalt,
        this.props.username, newKey.toString('hex'));


      const responseStepTwo = await axios.post(
        'http://localhost:4500/user/update',
        {
          step: '2',
          username: this.props.username,
          clientSessionProof: clientSession.proof
        },
        { headers: { 'Content-Type': 'application/json' } }
      )
      console.log('res2', responseStepTwo.data)

      if (!responseStepTwo || !responseStepTwo.data || !responseStepTwo.data.stepTwoComplete) {
        this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'res 2 User data could not be updated.' });
        return;
      }

      srp.verifySession(clientEphemeral.public, clientSession, responseStepTwo.data.serverSessionProof);

      this.props.updateUserProof(clientSession.proof);
      this.setState({ currPassword: '', password: '', passwordMatch: '' });
      this.props.showMessage({ severity: 'success', summary: 'Updated.', detail: 'User updated.' });

    } catch (e) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Internal Server Error.' });
    }
  }

  generatePBKDF2Hash = (password, salt) => {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, hash) => {
        if (err) {
          reject();
        }
        resolve(hash);
      });
    });
  }

  render() {
    return (
      <div className="user">
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-user"></i>
          </span>
          <InputText type="text" value={this.props.username} name="username" disabled />
        </div>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon">@</span>
          <InputText type="mail" value={this.state.mail} name="mail" onChange={this.handleChange} placeholder="E-Mail" />
        </div>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.currPassword} name="currPassword" onChange={this.handleChange} placeholder="Current Password" />
        </div>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.password} name="password" onChange={this.handleChange} placeholder="New Password" />
        </div>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.passwordMatch} name="passwordMatch" onChange={this.handleChange} placeholder="Comfirm new Password" />
        </div>
        <Button label="Update" icon="pi pi-user-edit" onClick={this.update} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  console.log('user_component_state:', state)
  let username = state.user.username;
  let mail = state.user.mail;
  let salt = state.user.salt;
  return {
    username,
    mail,
    salt
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateUserProof: proof => dispatch(updateUserProof(proof)),
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(User);