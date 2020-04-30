import React from 'react';
import './register.component.sass';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import * as srp from 'secure-remote-password/client';
import * as axios from 'axios';
import * as crypto from 'crypto';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { showMessage } from '../../redux/actions/index';

class Register extends React.Component {

  constructor(props) {
    super(props);
    this.state = { username: '', mail: '', password: '', passwordMatch: '' };
  }

  handleChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  };

  register = async () => {

    if (this.state.username === '') {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please type in a username.' });
      return;
    }

    if (!this.state.username.match(/^[a-zA-Z]{0,20}$/)) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Your username does not meet the requirements.' });
      return;
    }

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

      const salt = srp.generateSalt();
      const key = await this.generatePBKDF2Hash(this.state.password, salt + this.state.username);
      const verifier = srp.deriveVerifier(key.toString('hex'));


      const response = await axios.post(
        process.env.NODE_ENV === 'production' ? '/register' : 'http://localhost:4500/register',
        {
          username: this.state.username,
          email: this.state.mail,
          salt: salt,
          verifier: verifier
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response && response.data && response.data.registered) {
        this.setState({ username: '', mail: '', password: '', passwordMatch: '' });
        this.props.hideModal('registerVisible');
        this.props.showModal('loginVisible');
        this.props.history.push('/login');
        this.props.showMessage({ severity: 'success', summary: 'Registration succesful', detail: 'Please sign in to your account.' });
      } else {
        this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Registration not succesful.' });
      }
    } catch (e) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Internal Server Error.' });
    }

  }

  generatePBKDF2Hash = (password, salt) => {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(password, salt, 100000, 32, 'sha256', (err, hash) => {
        if (err) {
          resolve(null);
        }
        resolve(hash);
      });
    });
  }

  render() {
    return (
      <div className="register">
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-user"></i>
          </span>
          <InputText type="text" value={this.state.username} name="username" onChange={this.handleChange} placeholder="Username" />
        </div>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon">@</span>
          <InputText type="mail" value={this.state.mail} name="mail" onChange={this.handleChange} placeholder="E-Mail" />
        </div>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.password} name="password" onChange={this.handleChange} placeholder="Password" />
        </div>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.passwordMatch} name="passwordMatch" onChange={this.handleChange} placeholder="Comfirm Password" />
        </div>
        <Button label="Register" icon="pi pi-sign-in" onClick={this.register} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(null, mapDispatchToProps)(withRouter(Register));