import React from 'react';
import './serviceDetails.component.sass';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';
import { connect } from 'react-redux';
import { addService, changeService, showMessage } from '../../../redux/actions/index';
import * as axios from 'axios';
import * as crypto from 'crypto';
import { storeService } from '../../../utilities/indexeddb.service';
import PickList from './pickList/pickList.component';

class ServiceDetails extends React.Component {

  constructor(props) {
    super(props);

    if (this.props.newService) {
      this.state = {
        name: '',
        url: '',
        account: '',
        version: 1,
        length: 8,
        rndBytes: '',
        lowercase: true,
        uppercase: false,
        numbers: false,
        specialChars: false,
        whitelist: ['!', '"', '#', '$', '%', '&', '`', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '{', '|', '}', `~`],
        blacklist: [],
        isFavorite: false
      }
    } else {
      this.state = { ...this.props.service }
      if (this.props.service.blacklist.length > 0) {
        let whitelist = ['!', '"', '#', '$', '%', '&', '`', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '{', '|', '}', `~`];
        for (const iterator of this.props.service.blacklist) {
          whitelist.splice(whitelist.indexOf(iterator), 1);
        }
        this.state.whitelist = whitelist;
      }
    }
  }

  handleChange = ({ target }) => {
    if (target.name === 'version') {
      this.setState({ [target.name]: parseInt(target.value) });
    } else {
      this.setState({ [target.name]: target.value });
    }
  };

  onChangeSlider = (e) => {
    let newValue;
    if (e.target && e.target.nodeName === "INPUT") {
      newValue = parseInt(e.target.value);
    }
    else {
      newValue = e.value;
    }

    this.setState({ length: newValue });
  }

  handleSubmit = async () => {
    if (this.state.name === '' || this.state.name === ' ') {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please enter a service name.' });
      return;
    }

    if (!this.state.lowercase && !this.state.uppercase && !this.state.numbers && !this.state.specialChars) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please select at least one password component.' });
      return;
    }

    if (this.props.newService) {
      this.state.rndBytes = crypto.randomBytes(16).toString('hex');
      const response = await this.sendSaveRequest(this.props.newService);

      if (response && response.id) {
        this.props.addService({ ...this.state, id: response.id });
        this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service added!' });
      } else {
        this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be added!' });
      }
    } else {
      const response = await this.sendSaveRequest(false);

      if (response && response.saved) {
        this.props.changeService(this.state);
        this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service changed!' });
      } else {
        this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be changed!' });
      }
    }
    // hides the dialog by calling the handleDialogHide function inside service or serviceCard component)
    this.props.handleDialogHide();
  }

  sendSaveRequest = async (newService) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          process.env.NODE_ENV === 'production' ? '/service/save' : 'http://localhost:4500/service/save',
          {
            username: this.props.username,
            ...this.state,
            newService: newService,
            clientSessionProof: this.props.clientSessionProof
          },
          { headers: { 'Content-Type': 'application/json' } }
        )

        if (response && response.data && response.data.saved) {
          resolve(response.data);
        } else {
          resolve(false);
        }
      } catch (e) {
        resolve(false);
      }
    });
  }

  handleSubmitOffline = async () => {
    if (this.state.name === '' || this.state.name === ' ') {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please enter a service name.' });
      return;
    }

    if (!this.state.lowercase && !this.state.uppercase && !this.state.numbers && !this.state.specialChars) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Please select at least one password component.' });
      return;
    } 

    try {
      if (this.props.newService) {
        this.state.rndBytes = crypto.randomBytes(16).toString('hex');
        const id = await storeService(this.state);
        this.props.addService({ ...this.state, id: id });
        this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service added!' });
      } else {
        await storeService(this.state);
        this.props.changeService(this.state);
        this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service changed!' });
      }

      // hides the dialog by calling the handleDialogHide function inside service or serviceCard component)
      this.props.handleDialogHide();
    } catch (error) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be saved!' });
    }
  }

  handleCharListChanges = (source, target) => {
    this.setState({ whitelist: source });
    this.setState({ blacklist: target });
  }

  render() {
    return (
      <div className="serviceDetails">
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon inputgroup-addon-edit-service">Name</span>
          <InputText className="inputtext-edit-service" type="text" value={this.state.name} name="name" onChange={this.handleChange} placeholder="Name" />
        </div>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon inputgroup-addon-edit-service">URL</span>
          <InputText className="inputtext-edit-service" type="text" value={this.state.url} name="url" onChange={this.handleChange} placeholder="Url" />
        </div>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon inputgroup-addon-edit-service">Account</span>
          <InputText className="inputtext-edit-service" type="text" value={this.state.account} name="account" onChange={this.handleChange} placeholder="Account" />
        </div>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon inputgroup-addon-edit-service">Version</span>
          <InputText className="inputtext-edit-service" type="number" value={this.state.version} name="version" onChange={this.handleChange} placeholder="Version" min={1} />
        </div>
        <div className="inputgroup-slider">
          <div className="p-inputgroup">
            <span className="p-inputgroup-addon inputgroup-addon-edit-service inputgroup-addon-edit-service-length">Length</span>
            <InputText className="inputtext-edit-service inputtext-edit-service-length" type="number" value={this.state.length} name="length" onChange={this.onChangeSlider} min={8} max={100} />
          </div>
          <Slider value={this.state.length} style={{ width: "262.5px" }} onChange={this.onChangeSlider} min={8} max={100} />
        </div>
        <div className="inputswitch-group mt-3">
          <label className="switch-name">Letters</label>
          <InputSwitch onLabel="Yes" offLabel="No" checked={this.state.lowercase} onChange={(e) => this.setState({ lowercase: e.value })} />
        </div>
        <div className="inputswitch-group mt-2">
          <label className="switch-name">Cap. Letters</label>
          <InputSwitch onLabel="Yes" offLabel="No" checked={this.state.uppercase} onChange={(e) => this.setState({ uppercase: e.value })} />
        </div>
        <div className="inputswitch-group mt-2">
          <label className="switch-name">Numbers</label>
          <InputSwitch onLabel="Yes" offLabel="No" checked={this.state.numbers} onChange={(e) => this.setState({ numbers: e.value })} />
        </div>
        <div className="inputswitch-group mt-2 mb-2">
          <label className="switch-name">Spec. Chararacters</label>
          <InputSwitch onLabel="Yes" offLabel="No" checked={this.state.specialChars} onChange={(e) => this.setState({ specialChars: e.value })} />
        </div>
        {this.state.specialChars ?
          <PickList handleCharListChanges={this.handleCharListChanges} whitelist={this.state.whitelist} blacklist={this.state.blacklist}></PickList>
          : ''}
        <div className="button-container mt-2">
          <Button className="mt-2" label="Save" icon="pi pi-check" style={{ marginRight: '.25em' }} onClick={this.props.isOfflineMode ? this.handleSubmitOffline : this.handleSubmit} />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  const username = state.user.username;
  const clientSessionProof = state.user.clientSessionProof;
  const isOfflineMode = state.user.isOfflineMode;
  return { username, clientSessionProof, isOfflineMode }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addService: service => dispatch(addService(service)),
    changeService: service => dispatch(changeService(service)),
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDetails);