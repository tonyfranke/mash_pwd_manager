import React from 'react';
import './serviceDelete.component.sass';
import { connect } from 'react-redux';
import { deleteService, showMessage } from '../../../redux/actions/index';
import { Button } from 'primereact/button';
import { deleteService as deleteServiceIndexedDB } from '../../../utilities/indexeddb.service';
import { sendPostRequest } from '../../../utilities/request.service'

class ServiceDelete extends React.Component {

  hideDialog = () => {
    this.props.handleDialogHide()
  }

  handleDeleteService = async () => {
    try {
      if (this.props.isOfflineMode) {
        await deleteServiceIndexedDB(this.props.service.id);
        this.props.deleteService(this.props.service);
        this.props.showMessage({ severity: 'success', summary: 'Sucess', detail: 'Service deleted.' });
      } else {

        let body = {
          username: this.props.username,
          ...this.props.service,
          delete: true,
          clientSessionProof: this.props.clientSessionProof
        }

        const response = await sendPostRequest('/service/delete', body);
        
        if (response && response.data && response.data.deleted) {
          this.props.deleteService(this.props.service);
          this.props.showMessage({ severity: 'success', summary: 'Sucess', detail: 'Service deleted.' });
        }
      }
    } catch (e) {
      this.props.showMessage({ severity: 'error', summary: 'Error', detail: 'Service could not be deleted.' });
    }
  }

  render() {
    return (
      <div className="service-delete-dialog">
        <p>Are you sure you want to delete this service?</p>
        <Button label='Yes' className='p-button-primary button-response' onClick={this.handleDeleteService} />
        <Button label='No' className='p-button-primary button-response' onClick={this.hideDialog} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  let username = state.user.username;
  let clientSessionProof = state.user.clientSessionProof;
  let isOfflineMode = state.user.isOfflineMode;

  return {
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

export default connect(mapStateToProps, mapDispatchToProps)(ServiceDelete);