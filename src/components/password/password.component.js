import React from 'react';
import './password.component.sass';
import { InputText } from "primereact/inputtext";
import { Button } from 'primereact/button';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { loginUser, setServices } from '../../redux/actions/index';
import { openDatabase, readServices, setDatabase } from '../../utilities/indexeddb.service';

class Password extends React.Component {

  constructor(props) {
    super(props);
    this.state = { password: '' };
  }

  handleChange = ({ target }) => {
    this.setState({ [target.name]: target.value });
  };

  handleEnter = (event) => {
    // event.which returns the ascii-code of the character that was pressed --> 13 equals enter key
    if (event && event.which && event.which === 13) {
      this.startOffline();
    }
  };

  startOffline = async () => {
    if (this.state.password !== '') {
      const user = {
        username: 'offline',
        password: this.state.password,
        isAuthenticated: true,
        clientSessionProof: '',
        isOfflineMode: true,
      };

      try {
        const db = await openDatabase();

        if (db) {
          setDatabase(db);
          const services = await readServices();

          this.props.loginUser(user);
          this.props.setServices(services);

          this.setState({ password: '' });
          this.props.hideModal('passwordDialogVisible');
          this.props.history.push('/services');
        }
      } catch (error) {
        // TODO: error messsage toast or sth else
        console.error('error', error);
      }
    }
  }

  render() {
    return (
      <div className="login" onKeyUp={this.handleEnter}>
        <div className="p-inputgroup mb-3">
          <span className="p-inputgroup-addon">
            <i className="pi pi-key"></i>
          </span>
          <InputText type="password" value={this.state.password} name="password" onChange={this.handleChange} placeholder="Password" />
        </div>
        <Button label={this.props.buttonLabel} icon="pi pi-unlock" onClick={this.startOffline} />
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
    setServices: services => dispatch(setServices(services))
  }
}

export default connect(null, mapDispatchToProps)(withRouter(Password));