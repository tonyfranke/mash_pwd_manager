import React from 'react';
import './login.component.sass';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import * as srp from 'secure-remote-password/client';
import * as axios from 'axios';
import * as crypto from 'crypto';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUser, addService, showMessage, sortServices } from '../../redux/actions/index';
import { whitelist } from '../../utilities/constants';

class Login extends React.Component {

  constructor(props) {
    super(props);
    this.state = { username: '', password: '' };
  }

  handleChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  };

  handleEnter = (event) => {
    // event.which returns the ascii-code of the character that was pressed --> 13 equals enter key
    if (event && event.which && event.which === 13) {
      this.login();
    }
  };

  login = async () => {

    if (this.state.username !== '' && this.state.password !== '') {
      try {

        const clientEphemeral = srp.generateEphemeral()

        const responseStepOne = await axios.post(
          process.env.NODE_ENV === 'production' ? '/login' : 'http://localhost/login',
          {
            step: '1',
            username: this.state.username,
            clientPublicEphemeral: clientEphemeral.public
          },
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (responseStepOne && responseStepOne.data && responseStepOne.data.stepOneComplete) {

          const key = await this.generatePBKDF2Hash(this.state.password, responseStepOne.data.salt + this.state.username);
          const clientSession = srp.deriveSession(clientEphemeral.secret, responseStepOne.data.serverEphemeral, responseStepOne.data.salt, this.state.username, key.toString('hex'));

          const responseStepTwo = await axios.post(
            process.env.NODE_ENV === 'production' ? '/login' : 'http://localhost/login',
            {
              step: '2',
              username: this.state.username,
              clientSessionProof: clientSession.proof
            },
            { headers: { 'Content-Type': 'application/json' } }
          )

          if (responseStepTwo && responseStepTwo.data && responseStepTwo.data.stepTwoComplete) {

            srp.verifySession(clientEphemeral.public, clientSession, responseStepTwo.data.serverSessionProof);

            const user = { ...this.state };
            user.mail = responseStepOne.data.mail;
            user.salt = responseStepOne.data.salt;
            user.isAuthenticated = true;
            user.isOfflineMode = false;
            user.clientSessionProof = clientSession.proof;
            this.props.loginUser(user);

            for (const service of responseStepTwo.data.services) {
              service.lowercase === 1 ? service.lowercase = true : service.lowercase = false;
              service.uppercase === 1 ? service.uppercase = true : service.uppercase = false;
              service.numbers === 1 ? service.numbers = true : service.numbers = false;
              service.specialChars === 1 ? service.specialChars = true : service.specialChars = false;
              service.isFavorite === 1 ? service.isFavorite = true: service.isFavorite = false;
              service.whitelist = [...whitelist];
              for (const char of service.blacklist) {
                service.whitelist.splice(service.whitelist.indexOf(char), 1);
              }
              this.props.addService(service);
            }

            this.setState({ username: '', password: '' });
            this.props.hideModal('loginVisible');
            this.props.sortServices(1)
            this.props.history.push('/services');
            this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Login successful!' });
          } else {
            // wrong password
            this.props.showMessage({ severity: 'error', summary: 'Login failed!', detail: 'Wrong Username/Password.' });
          }
        } else {
          // username not known
          this.props.showMessage({ severity: 'error', summary: 'Login failed!', detail: 'Wrong Username/Password.' });
        }
      } catch (e) {
        this.props.showMessage({ severity: 'error', summary: 'Login failed!', detail: 'Internal Server Error.' });
      }
    } else {
      // not all inputs filled
      this.props.showMessage({ severity: 'error', summary: 'Login failed!', detail: 'Username or password is missing.' });
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
      <div className="login" onKeyUp={this.handleEnter}>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-user"></i>
          </span>
          <InputText type="text" value={this.state.username} name="username" onChange={this.handleChange} placeholder="Username" />
        </div>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.password} name="password" onChange={this.handleChange} placeholder="Password" />
        </div>
        <Button label="Login" icon="pi pi-unlock" onClick={this.login} />
      </div>
    );
  }

}

// const mapStateToProps = (state) => {
//   // let store = state;
//   // console.log(store)
//   return {
//     state
//   }
// }

const mapDispatchToProps = (dispatch) => {
  return {
    loginUser: user => dispatch(loginUser(user)),
    addService: service => dispatch(addService(service)),
    sortServices: sortDir => dispatch(sortServices(sortDir)),
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(null, mapDispatchToProps)(withRouter(Login));