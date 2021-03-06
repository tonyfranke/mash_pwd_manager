import React from 'react';
import './serviceCard.component.sass';
import { connect } from 'react-redux';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import ServiceDetails from '../serviceDetails/serviceDetails.component';
import { deleteService, showMessage } from '../../../redux/actions/index';
import { InputText } from 'primereact/inputtext';
import { calculatePassword } from '../../../utilities/calculatePassword.service';
import * as axios from 'axios';
import { deleteService as deleteServiceIndexedDB } from '../../../utilities/indexeddb.service';
import { defaultTooltipOptions } from '../../../utilities/defaultTooltipOptions.service';

class ServiceCard extends React.Component {

  constructor(props) {
    super(props);

    if (this.props.service.url) {
      this.state = {
        password: '',
        inputType: 'password',
        inputTypeIsPassword: true,
        showButtonIcon: 'pi pi-eye',
        copyButtonIcon: 'pi pi-copy',
        serviceDetailsVisible: false,
        items: [
          {
            label: 'Generate',
            icon: 'pi pi-fw pi-external-link',
            command: this.handleGeneratePassword
          },
          {
            label: 'Show Password',
            icon: 'pi pi-fw pi-eye',
            command: this.handleChangeInputType
          },
          {
            label: 'Copy',
            icon: 'pi pi-fw pi-copy',
            command: this.handleCopyToClipboard
          },
          {
            label: 'Open URL',
            icon: 'pi pi-fw pi-external-link',
            command: this.handleOpenURL
          },
          {
            label: 'Edit',
            icon: 'pi pi-fw pi-cog',
            command: this.handleDialogShow
          },
          {
            separator: true
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-times',
            command: this.props.isOfflineMode ? this.handleDeleteServiceOffline : this.handleDeleteService
          }
        ]
      };
    } else {
      this.state = {
        password: '',
        inputType: 'password',
        inputTypeIsPassword: true,
        showButtonIcon: 'pi pi-eye',
        copyButtonIcon: 'pi pi-copy',
        serviceDetailsVisible: false,
        items: [
          {
            label: 'Generate',
            icon: 'pi pi-fw pi-external-link',
            command: this.handleGeneratePassword
          },
          {
            label: 'Show Password',
            icon: 'pi pi-fw pi-eye',
            command: this.handleChangeInputType
          },
          {
            label: 'Copy',
            icon: 'pi pi-fw pi-copy',
            command: this.handleCopyToClipboard
          },
          {
            label: 'Edit',
            icon: 'pi pi-fw pi-cog',
            command: this.handleDialogShow
          },
          {
            separator: true
          },
          {
            label: 'Delete',
            icon: 'pi pi-fw pi-times',
            command: this.props.isOfflineMode ? this.handleDeleteServiceOffline : this.handleDeleteService
          }
        ]
      };
    }
  }

  handleDialogShow = () => {
    this.setState({ serviceDetailsVisible: true });
  }

  handleDialogHide = () => {
    this.setState({ serviceDetailsVisible: false });
  }

  handleDeleteService = async () => {
    try {
      const response = await axios.post(
        process.env.NODE_ENV === 'production' ? '/service/delete' : 'http://localhost:4500/service/delete',
        {
          username: this.props.username,
          ...this.props.service,
          delete: true,
          clientSessionProof: this.props.clientSessionProof
        },
        { headers: { 'Content-Type': 'application/json' } }
      )

      if (response && response.data && response.data.deleted) {
        this.props.deleteService(this.props.service);
        this.props.showMessage({ severity: 'success', summary: 'Sucess', detail: 'Service deleted.' });
      } else {
        this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be deleted.' });
      }
    } catch (e) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Internal Server Error.' });
    }
  }

  handleDeleteServiceOffline = async () => {
    try {
      await deleteServiceIndexedDB(this.props.service.id);
      this.props.deleteService(this.props.service);
      this.props.showMessage({ severity: 'success', summary: 'Sucess', detail: 'Service deleted.' });
    } catch (error) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be deleted.' });
    }

  }

  handleGeneratePassword = async () => {
    let password = await calculatePassword(this.props.masterpassword, this.props.service);

    if (password) {
      this.setState({ password: password });
    } else {
      console.error('error');
    }
  }

  handleChangeInputType = () => {
    if (this.state.inputTypeIsPassword) {
      this.setState({ inputType: 'text' });
      this.setState({ showButtonIcon: 'pi pi-eye-slash' });
      this.setState({ inputTypeIsPassword: false });
      this.setState(prevState => {
        const newState = { ...prevState };
        newState.items[1].label = 'Hide Password';
        newState.items[1].icon = 'pi pi-eye-slash';
        return newState;
      });
    } else {
      this.setState({ inputType: 'password' });
      this.setState({ showButtonIcon: 'pi pi-eye' });
      this.setState({ inputTypeIsPassword: true });
      this.setState(prevState => {
        const newState = { ...prevState };
        newState.items[1].label = 'Show Password';
        newState.items[1].icon = 'pi pi-eye';
        return newState;
      });
    }
  }

  handleOpenURL = () => {
    window.open(this.props.service.url, '_blank');
  }

  handleCopyToClipboard = () => {
      const el = document.createElement('textarea');
      el.value = this.state.password;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
  }

  handleClearPassword = () => {
    this.setState({ password: '' })
  }

  footer = <span>
    <Button icon="pi pi-cog" style={{ marginRight: '.25em' }} onClick={this.handleDialogShow} tooltip="Edit Service"  tooltipOptions={defaultTooltipOptions} />
    <Button icon="pi pi-trash" className="p-button-secondary" onClick={this.props.isOfflineMode ? this.handleDeleteServiceOffline : this.handleDeleteService} 
      tooltip="Delete Service" tooltipOptions={defaultTooltipOptions} />
  </span>;

  render() {
    return (
      <div className="serviceCard-container" onContextMenu={(e) => this.cm.show(e)}>
        {/* <div className="service-card-container d-inline"> */}
        <Card title={this.props.service.name} footer={this.footer} className="service-card">
          {this.props.service.account === '' ?
            <p className="service-card-account service-card-account-hidden">placeholder</p>
            : <p className="service-card-account">{this.props.service.account}</p>}
          <InputText readOnly className="servicePasswordInputText" type={this.state.inputType} value={this.state.password} />
          <Button label="Calculate" onClick={this.handleGeneratePassword} />
          <Button icon={this.state.showButtonIcon} onClick={this.handleChangeInputType} tooltip={this.state.inputTypeIsPassword ? 'Show Password' : 'Hide Password'} 
            tooltipOptions={defaultTooltipOptions} />
          <Button icon={this.state.copyButtonIcon} onClick={this.handleCopyToClipboard} tooltip={'Copy Password'} tooltipOptions={defaultTooltipOptions} />
          <Button icon="pi pi-times" onClick={this.handleClearPassword} tooltip={'Clear Password'} tooltipOptions={defaultTooltipOptions} />
        </Card>
        <ContextMenu model={this.state.items} ref={el => this.cm = el}></ContextMenu>
        {(this.state.serviceDetailsVisible) ? /* Conditional rendering of the Dialog */
          <Dialog header="Edit Service" visible={this.state.serviceDetailsVisible} modal={true} onHide={this.handleDialogHide}>
            <ServiceDetails service={this.props.service} handleDialogHide={this.handleDialogHide} />
          </Dialog>
          : ''}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  let service = state.services.find(element => {
    return element.id === ownProps.id;
  });

  let masterpassword = state.user.password;
  let username = state.user.username;
  let clientSessionProof = state.user.clientSessionProof;
  let isOfflineMode = state.user.isOfflineMode;

  return {
    service,
    masterpassword,
    username,
    clientSessionProof,
    isOfflineMode
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    deleteService: service => dispatch(deleteService(service)),
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCard);
