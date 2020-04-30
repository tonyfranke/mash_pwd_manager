import React from 'react';
import ReactDOM from 'react-dom';
import './index.sass';
import App from './components/App';
import * as serviceWorker from './serviceWorker';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import 'bootstrap/dist/css/bootstrap.min.css';

import { Provider } from 'react-redux';
import store from './redux/store/store';



import { addService, changeService, deleteService } from './redux/actions/index';
window.store = store;
window.changeService = changeService;
window.addService = addService;
window.deleteService = deleteService;



ReactDOM.render(<Provider store={store}><App /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
