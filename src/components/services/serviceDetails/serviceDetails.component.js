import React from 'react';
import './serviceDetails.component.sass';
import { InputText } from 'primereact/inputtext';
import { InputSwitch } from 'primereact/inputswitch';
import { Slider } from 'primereact/slider';
import { Button } from 'primereact/button';
import { connect } from 'react-redux';
import { addService, changeService, showMessage } from '../../../redux/actions/index';
import * as crypto from 'crypto';
import { storeService } from '../../../utilities/indexeddb.service';
import PickList from './pickList/pickList.component';
import { sendPostRequest } from '../../../utilities/request.service'

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

    try {
      if (this.props.isOfflineMode) {
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
      } else {
        this.state.rndBytes = crypto.randomBytes(16).toString('hex');
        let body = {
          username: this.props.username,
          ...this.state,
          newService: this.props.newService,
          clientSessionProof: this.props.clientSessionProof
        }

        const responseData = await sendPostRequest('/service/save', body);

        if (responseData && responseData.id) {
          if (this.props.newService) {
            this.props.addService({ ...this.state, id: responseData.id });
            this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service added!' });
          } else {
            this.props.changeService(this.state);
            this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service changed!' });
          }
          this.props.handleDialogHide();
        }
      }
    } catch (e) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be added!' });
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
          <Button className="mt-2" label="Save" icon="pi pi-check" style={{ marginRight: '.25em' }} onClick={this.handleSubmit} />
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