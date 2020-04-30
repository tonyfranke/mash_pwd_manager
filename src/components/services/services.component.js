import React from 'react';
import './services.component.sass';
import ServiceCard from './serviceCard/serviceCard.component';
import { connect } from 'react-redux';
import { deleteService } from '../../redux/actions/index';
import { Dialog } from 'primereact/dialog';
import ServiceDetails from './serviceDetails/serviceDetails.component';
import ControlBar from './controlBar/controlBar.component';

class Services extends React.Component {

  constructor(props) {
    super(props);
    this.state = { serviceDetailsVisible: false }
  }

  handleDialogShow = () => {
    this.setState({ serviceDetailsVisible: true });
  }

  handleDialogHide = () => {
    this.setState({ serviceDetailsVisible: false });
  }

  render() {
    return (
      <div className="services">
        <ControlBar handleDialogShow={this.handleDialogShow} />
        <div className="servicesList">
          {this.props.services.map((service) => (
            <div className="service" key={service}><ServiceCard id={service} /></div>
          ))}
        </div>
        {(this.state.serviceDetailsVisible) ? /* Conditional rendering of the Dialog */
          <Dialog header="Add Service" blockScroll={false} visible={this.state.serviceDetailsVisible} modal={true} onHide={this.handleDialogHide}>
            <ServiceDetails newService={true} handleDialogHide={this.handleDialogHide} />
          </Dialog>
        : ''}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let services = [];
  for (const service of state.displayedServices) {
    services.push(service.id);
  }
  return {
    services
  }
}

const mapDispatchToProps = (dispatch) => {

  return {
    deleteService: service => dispatch(deleteService(service))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Services);