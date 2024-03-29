import React from 'react';
import './controlBar.component.sass';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { connect } from 'react-redux';
import { addService, filterServices, showMessage, sortServices } from '../../../redux/actions';
import { exportServices, readFile } from '../../../utilities/import-export.service';
import { defaultTooltipOptions } from '../../../utilities/defaultTooltipOptions.service';
import { storeService } from '../../../utilities/indexeddb.service';
import { sendPostRequest } from '../../../utilities/request.service';


class ControlBar extends React.Component {

  constructor(props) {
    super(props);
    this.fileUploadInput = React.createRef();
    this.dropdownContent = React.createRef();

    this.state = {
      keyword: '',
      sortDir: 1
    }
  }

  // TODO: deprecated, needs to be fixed
  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutsideDropdown);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutsideDropdown);
  }

  handleInputTextChanges = (e) => {
    this.setState({ keyword: e.target.value }, () => {
      let displayedServices = [];
      
      if (this.state.keyword === '') {
        displayedServices = this.props.services
      } else {
        for (const service of this.props.services) {
          let serviceName = service.name.toLowerCase()
          let key = this.state.keyword.toLowerCase()
          if (serviceName.includes(key)) {
            displayedServices.push(service);
          }
        }
      }

      this.props.filterServices(displayedServices);
      this.setState({ sortDir: this.state.sortDir * -1 }, () => { // setState runs async, therefore we have to wait for the state to be change before sorting
        this.sortDisplayedServices()
      })
    });
  }

  openUploadDialog = () => {
    this.toggleDropdownMenu();
    this.fileUploadInput.current.click();
  }

  import = async () => {
    if (!this.fileUploadInput.current.files[0] || this.fileUploadInput.current.files[0].type !== 'application/json') {
      this.props.showMessage({ severity: 'error', summary: 'Upload failed!', detail: 'Invalid file type. Please upload a JSON-File.' });
      return;
    }

    try {
      let services = await readFile(this.fileUploadInput.current.files[0]);
      delete services[0].id
      if (this.props.isOfflineMode) {
        for (const service of services) {
          delete service.id
          const id = await storeService(service);
          service.id = id;
          this.props.addService(service);
        }
      } else {

        for (const service of services) {
          let body = {
            username: this.props.username,
            ...service,
            newService: true,
            clientSessionProof: this.props.clientSessionProof
          }

          const responseData = await sendPostRequest('/service/save', body)

          if (responseData && responseData.id) {
            service.id = responseData.id;
            this.props.addService(service);
          }
        }
      }
      this.fileUploadInput.current.value = null;
      this.props.showMessage({ severity: 'success', summary: 'Import complete.', detail: 'Services import successful.' });
    } catch (e) {
      this.props.showMessage({ severity: 'error', summary: 'Upload failed!', detail: 'File could not be read.' });
    }
  }


  export = () => {
    exportServices(this.props.services);
    this.toggleDropdownMenu();
  }

  sortDisplayedServices = () => {
    if (this.state.sortDir === 0 || this.state.sortDir === -1) {
      this.props.sortServices(1)
      this.setState({ sortDir: 1 })
    } else if (this.state.sortDir === 1) {
      this.props.sortServices(-1)
      this.setState({ sortDir: -1 })
    }
  }

  handleClickOutsideDropdown = (event) => {
    if (!event.target.parentElement || (!event.target.parentElement.matches('.dropdown-button')
      && !event.target.parentElement.matches('.dropdown-content-item'))) {
      this.dropdownContent.current.classList.remove('show');
    }
  }

  toggleDropdownMenu = () => {
    if (this.dropdownContent.current.classList.contains('show')) {
      this.dropdownContent.current.classList.remove('show');
    } else {
      this.dropdownContent.current.classList.add('show');
    }
  }

  render() {
    return (
      <div className="control-bar">
        <div className="row justify-content-center control-bar-row">
          <div className="col-12 col-sm-8 col-md-8 col-lg-6 col-xl-3 control-bar-content">
            <Button className="p-button-secondary button-add" icon="pi pi-plus" onClick={this.props.handleDialogShow}
              tooltip="Add Service" tooltipOptions={defaultTooltipOptions} />

            <Button icon="pi pi-sort-alt" className="p-button-secondary dropdown-button" onClick={this.sortDisplayedServices} />
            <div className="dropdown">
              <Button icon="pi pi-arrow-down" className="p-button-secondary dropdown-button" onClick={this.toggleDropdownMenu} />
              <div ref={this.dropdownContent} className="dropdown-content">
                <Button label="Import" className="p-button-secondary dropdown-content-item" icon="pi pi-upload" onClick={this.openUploadDialog}
                  tooltip="Import Services from JSON-File" tooltipOptions={defaultTooltipOptions} />
                <Button label="Export" className="p-button-secondary dropdown-content-item" icon="pi pi-download" onClick={this.export}
                  tooltip="Exports all Services to a JSON-File" tooltipOptions={defaultTooltipOptions} />
              </div>
            </div>
            <input ref={this.fileUploadInput} id="fileUpload" type="file" accept="application/json" onChange={this.import} hidden />
            <div className="p-inputgroup control-bar-search">
              <span className="p-inputgroup-addon"><i className="pi pi-search"></i></span>
              <InputText type="text" value={this.state.keyword} name="keyword" onChange={this.handleInputTextChanges} placeholder="Keyword" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let services = [];
  const username = state.user.username;
  const clientSessionProof = state.user.clientSessionProof;
  const isOfflineMode = state.user.isOfflineMode;
  for (const service of state.services) {
    services.push(service);
  }
  return {
    services,
    username,
    clientSessionProof,
    isOfflineMode
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addService: service => dispatch(addService(service)),
    filterServices: services => dispatch(filterServices(services)),
    sortServices: sortDir => dispatch(sortServices(sortDir)),
    showMessage: content => dispatch(showMessage(content))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ControlBar);