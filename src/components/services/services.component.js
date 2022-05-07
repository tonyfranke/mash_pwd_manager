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
        { (this.props.favoriteServices.length > 0) ?
            <h2 className="list-heading">Favorites</h2> : ''
        }
        <div className="services-list">
          {this.props.favoriteServices.map((service) => (
            <div className="service" key={service}><ServiceCard id={service} /></div>
            ))}
        </div>
        { (this.props.services.length > 0) ? 
          <h2 className="list-heading">Services</h2> : ''
        }
        <div className="services-list">
          {this.props.services.map((service) => (
            <div className="service" key={service}><ServiceCard id={service} /></div>
          ))}
        </div>
        { (this.state.serviceDetailsVisible) ? /* Conditional rendering of the Dialog */
          <Dialog header="Add Service" blockScroll={false} visible={this.state.serviceDetailsVisible} modal={true} onHide={this.handleDialogHide}>
            <ServiceDetails newService={true} handleDialogHide={this.handleDialogHide} />
          </Dialog>
        : ''}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  let favoriteServices = []
  let services = []
  for (const service of state.displayedServices) {
    if (service.isFavorite) {
      favoriteServices.push(service.id)
    } else {
      services.push(service.id)
    }
  }

  return {
    favoriteServices,
    services
  }
}

const mapDispatchToProps = (dispatch) => {

  return {
    deleteService: service => dispatch(deleteService(service)) // TODO: check whether neccessary or not
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Services);