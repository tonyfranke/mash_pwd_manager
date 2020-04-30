import React from 'react';
import './timer.component.sass';
import { withRouter } from "react-router-dom";
import { connect } from 'react-redux';
import { logoutUser } from '../../redux/actions/index';
import IdleTimer from 'react-idle-timer';

class Timer extends React.Component {

  constructor(props) {
    super(props);
    this.idleTimer = null;
    this.state = { remainingTime: '' };
  }

  // componentDidMount() {
  //   this.updateRemainingTime();
  // }

  // could be usefull for later
  onAction = (e) => {
    // console.log('user did something', e);
  }

  // could be usefull for later
  onActive = (e) => {
  //   console.log('user is active', e);
  //   console.log('time remaining', this.idleTimer.getRemainingTime());
  }

  onIdle = () => {
    this.props.logoutUser();
  }

  // updateRemainingTime = () => {
  //   setInterval(() => {
  //     console.log(this.idleTimer.getRemainingTime());
  //     this.setState({ remainingTime: this.idleTimer.getRemainingTime });
  //   }, 1000);
  // }

  render() {
    return (
      <IdleTimer
        ref={ref => { this.idleTimer = ref }}
        element={document}
        onActive={this.onActive}
        onIdle={this.onIdle}
        onAction={this.onAction}
        debounce={250}
        timeout={1000 * 60 * 10} />
    );
  }
}

const mapStateToProps = (state) => {
  let isAuthenticated = state.user.isAuthenticated;
  return {
    isAuthenticated
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logoutUser: user => dispatch(logoutUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Timer));