import React from 'react';
import './header.component.sass';
import Password from '../password/password.component';
import Login from '../login/login.component';
import Register from '../register/register.component';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { logoutUser } from '../../redux/actions/index';

class Header extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loginVisible: false, registerVisible: false, passwordDialogVisible: false };
  }

  showModal = (target) => {
    this.setState({ [target]: true });
  }

  hideModal = (target) => {
    this.setState({ [target]: false });
  }

  logout = () => {
    this.props.logoutUser({})
    this.props.history.push('/');
  }

  render() {
    return (
      <header className="container-fluid header">
        <div className="row header-row">
          {this.props.isAuthenticated ?
            <div className="col-7 col-sm-7 col-md-8 col-lg-9 col-xl-10">
              <Button label="Home" onClick={() => { this.props.history.push('/') }} />
              <Button label="Services" onClick={() => { this.props.history.push('/services') }} />
            </div> :
            <div className="col-4 col-sm-5 col-md-7 col-lg-8 col-xl-9">
              <Button label="Home" onClick={() => { this.props.history.push('/') }} />
            </div>}
          {this.props.isAuthenticated ?
            <div className="headerColRight col-5 col-sm-5 col-md-4 col-lg-3 col-xl-2 text-right">
              {!this.props.isOfflineMode ? <Button label="User" icon="pi pi-user" onClick={() => { this.props.history.push('/user') }} /> : ''}
              <Button label="Logout" icon="pi pi-sign-out" onClick={this.logout} />
            </div> :
            <div className="headerColRight col-8 col-sm-7 col-md-5 col-lg-4 col-xl-3 text-right">
              <Button label="Offline" icon="pi pi-sign-in" onClick={(e) => this.setState({ passwordDialogVisible: true })} />
              <Button label="Sign in" icon="pi pi-sign-in" onClick={(e) => this.setState({ loginVisible: true })} />
              <Button label="Register" onClick={(e) => this.setState({ registerVisible: true })} />
            </div>
          }
          <Dialog header="Offline Mode" visible={this.state.passwordDialogVisible} modal={true} onHide={() => this.setState({ passwordDialogVisible: false })}>
            <Password buttonLabel="Offline" showModal={this.showModal} hideModal={this.hideModal} />
          </Dialog>
          <Dialog header="Sign in" visible={this.state.loginVisible} modal={true} onHide={() => this.setState({ loginVisible: false })}>
            <Login showModal={this.showModal} hideModal={this.hideModal} />
          </Dialog>
          <Dialog header="Register" visible={this.state.registerVisible} modal={true} onHide={() => this.setState({ registerVisible: false })}>
            <Register showModal={this.showModal} hideModal={this.hideModal} />
          </Dialog>
        </div>
      </header >
    );
  }
}

const mapStateToProps = (state) => {
  let isAuthenticated = state.user.isAuthenticated
  let isOfflineMode = state.user.isOfflineMode
  return {
    isAuthenticated,
    isOfflineMode
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logoutUser: user => dispatch(logoutUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Header));