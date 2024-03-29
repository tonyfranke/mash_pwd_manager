import React from 'react';
import './serviceCard.component.sass';
import { connect } from 'react-redux';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { ContextMenu } from 'primereact/contextmenu';
import { Dialog } from 'primereact/dialog';
import ServiceDetails from '../serviceDetails/serviceDetails.component';
import { changeService, showMessage } from '../../../redux/actions/index';
import { InputText } from 'primereact/inputtext';
import { calculatePassword } from '../../../utilities/calculatePassword.service';
import { storeService } from '../../../utilities/indexeddb.service';
import { defaultTooltipOptions } from '../../../utilities/defaultTooltipOptions.service';
import { sendPostRequest } from '../../../utilities/request.service'
import ServiceDelete from '../serviceDelete/serviceDelete.component';

class ServiceCard extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      password: '',
      inputType: 'password',
      inputTypeIsPassword: true,
      showButtonIcon: 'pi pi-eye',
      copyButtonIcon: 'pi pi-copy',
      isFavorite: this.props.service.isFavorite,
      favoriteButtonIcon: this.props.service.isFavorite ? 'pi pi-star' : 'pi pi-star-o',
      serviceDetailsVisible: false,
      serviceDeleteVisible: false,
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
          command: this.handleEditDialogShow
        },
        {
          separator: true
        },
        {
          label: 'Delete',
          icon: 'pi pi-fw pi-times',
          command: this.handleDeleteDialogShow
        }
      ]
    }

    if (this.props.service.url) {
      let urlObject = {
        label: 'Open URL',
        icon: 'pi pi-fw pi-external-link',
        command: this.handleOpenURL
      }

      this.state.items.splice(3, 0, urlObject)
    }
  }

  handleEditDialogShow = () => {
    this.setState({ serviceDetailsVisible: true });
  }

  handleEditDialogHide = () => {
    this.setState({ serviceDetailsVisible: false });
  }

  handleDeleteDialogShow = () => {
    this.setState({ serviceDeleteVisible: true });
  }

  handleDeleteDialogHide = () => {
    this.setState({ serviceDeleteVisible: false });
  }

  handleGeneratePassword = async () => {
    let password = await calculatePassword(this.props.masterpassword, this.props.service);

    if (password) {
      this.setState({ password: password });
      this.handleCopyToClipboard()
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

  makeFavorite = async () => {
    try {
      if (this.state.isFavorite) {
        this.setState({ isFavorite: false })
        this.setState({ favoriteButtonIcon: 'pi pi-star-o' })
        this.props.service.isFavorite = false
      } else {
        this.setState({ isFavorite: true })
        this.setState({ favoriteButtonIcon: 'pi pi-star' })
        this.props.service.isFavorite = true
      }


      if (this.props.isOfflineMode) {
        await storeService(this.props.service)
        this.props.changeService(this.props.service)
        this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service changed!' });
      } else {
        let body = {
          username: this.props.username,
          ...this.props.service,
          newService: false,
          clientSessionProof: this.props.clientSessionProof
        }
        const responseData = await sendPostRequest('/service/save', body);
        console.log(responseData)

        if (responseData && responseData.saved) {
          this.props.changeService(this.props.service)
          this.props.showMessage({ severity: 'success', summary: 'Success', detail: 'Service changed!' });
        }
      }
    } catch (error) {
      console.error(error)
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be changed!' });
    }
  }

  footer = <span>
    <Button icon="pi pi-cog" style={{ marginRight: '.25em' }} onClick={this.handleEditDialogShow} tooltip="Edit Service" tooltipOptions={defaultTooltipOptions} />
    <Button icon="pi pi-trash" className="p-button-secondary" onClick={this.handleDeleteDialogShow} tooltip="Delete Service" tooltipOptions={defaultTooltipOptions} />
  </span>;

  render() {
    return (
      <div className="service-card-container" onContextMenu={(e) => this.cm.show(e)}>
        {/* <div className="service-card-container d-inline"> */}
        <Card title={this.props.service.name} footer={this.footer} className="service-card">
          {this.props.service.account === '' ?
            <p className="service-card-account service-card-account-hidden">placeholder</p>
            : <p className="service-card-account">{this.props.service.account}</p>}
          <InputText readOnly className="service-password-input-text" type={this.state.inputType} value={this.state.password} />
          <div className="service-card-button-container">
            <Button label="Generate" onClick={this.handleGeneratePassword} className="button-standard" />
            <Button icon={this.state.showButtonIcon} onClick={this.handleChangeInputType} tooltip={this.state.inputTypeIsPassword ? 'Show Password' : 'Hide Password'}
              tooltipOptions={defaultTooltipOptions} className="button-standard" />
            <Button icon={this.state.copyButtonIcon} onClick={this.handleCopyToClipboard} tooltip={'Copy Password'} tooltipOptions={defaultTooltipOptions} className="button-standard" />
            <Button icon="pi pi-times" onClick={this.handleClearPassword} tooltip={'Clear Password'} tooltipOptions={defaultTooltipOptions} className="button-standard" />
            <Button icon={this.state.favoriteButtonIcon} className="p-button-secondary button-favorite" onClick={this.makeFavorite} />
          </div>
        </Card>
        <ContextMenu model={this.state.items} ref={el => this.cm = el}></ContextMenu>
        {(this.state.serviceDetailsVisible) ? /* Conditional rendering of the Dialog */
          <Dialog header="Edit Service" visible={this.state.serviceDetailsVisible} modal={true} onHide={this.handleEditDialogHide}>
            <ServiceDetails service={this.props.service} handleDialogHide={this.handleEditDialogHide} />
          </Dialog>
          : ''}
        {(this.state.serviceDeleteVisible) ? /* Conditional rendering of the Dialog */
          <Dialog header="Delete Service" visible={this.state.serviceDeleteVisible} modal={true} onHide={this.handleDeleteDialogHide}>
            <ServiceDelete service={this.props.service} handleDialogHide={this.handleDeleteDialogHide} />
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
    changeService: service => dispatch(changeService(service)),
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ServiceCard);
