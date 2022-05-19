import React from 'react';
import { BrowserRouter, Route, Redirect } from "react-router-dom";
import './App.sass';
import Home from './home/home.component';
import Header from './header/header.component';
import Footer from './footer/footer.component';
import Services from './services/services.component';
import Imprint from './imprint/imprint.component';
import Timer from '../components/timer/timer.component';
import User from '../components/user/user.component';
import { connect } from 'react-redux';
import { Growl } from 'primereact/growl'


class App extends React.Component {

  componentWillReceiveProps(nextProps) {
    if (nextProps.message) {
      this.growl.show(nextProps.message);
    }
  }

  render() {
    return (
      <BrowserRouter>
        <Timer />
        <Header />
        <Growl ref={(el) => { this.growl = el; }}></Growl>

        <main className="content">
          <Route exact path="/" component={Home} />
          <Route path="/imprint" component={Imprint} />
          {this.props.isAuthenticated ?
            <Route path="/services" component={Services} /> :
            <Redirect to="/" />
          }
          {(this.props.isAuthenticated && !this.props.isOfflineMode) ?
            <Route path="/user" component={User} /> :
            <Redirect to="/" />
          }
        </main>
        {/* <Footer /> */}
        <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossOrigin="anonymous"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossOrigin="anonymous"></script>
        <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossOrigin="anonymous"></script>
      </BrowserRouter>
    );
  }
}

const mapStateToProps = (state) => {
  let isAuthenticated = state.user.isAuthenticated;
  let isOfflineMode = state.user.isOfflineMode;
  let message = state.message;

  return {
    isAuthenticated,
    isOfflineMode,
    message
  }
}

export default connect(mapStateToProps, null)(App);
