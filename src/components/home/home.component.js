import React from 'react';
import './home.component.sass';
import PasswordDemo from './PasswordDemo/passwordDemo.component';

class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = { loginVisible: false, registerVisible: false };
  }

  render() {
    return (
      <div className="home">
        <PasswordDemo/>
      </div>
    );
  }
}

export default Home;