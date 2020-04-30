import React from 'react';
import './passwordDemo.component.sass';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { calculatePassword } from '../../../utilities/calculatePassword.service';
import { whitelist } from '../../../utilities/constants';
import { defaultTooltipOptions } from '../../../utilities/defaultTooltipOptions.service'

class PasswordDemo extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      calculated: false,
      name: '',
      length: 20,
      password: '',
      servicePassword: ''
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

  handleGeneratePassword = async () => {

    if (this.state.name === '') {
      return;
    }

    if (this.state.password === '') {
      return;
    }

    let servicePassword = await calculatePassword(this.state.password, {
      name: this.state.name,
      account: '',
      version: 1,
      length: 20,
      lowercase: true,
      uppercase: true,
      numbers: true,
      specialChars: true,
      whitelist: whitelist,
      blacklist: [],
    });

    if (servicePassword) {
      this.setState({ calculated: true, servicePassword: servicePassword });
    } else {
      console.error('error');
    }
  }

  handleCopyToClipboard = () => {
    const el = document.createElement('textarea');
    el.value = this.state.servicePassword;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }

  handleClearPassword = () => {
    this.setState({ calculated: false, name: '', password: '', servicePassword: '' })
  }

  render() {
    return (
      <div className="passwordDemo">
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon"><i className="pi pi-globe"></i></span>
          <InputText className="inputtext-edit-service" type="text" value={this.state.name} name="name" onChange={this.handleChange} placeholder="Website" />
        </div>
        <div className="p-inputgroup mt-3 mb-3">
          <span className="p-inputgroup-addon"><i className="pi pi-lock"></i></span>
          <InputText className="inputtext-edit-service" type="password" value={this.state.password} name="password" onChange={this.handleChange} placeholder="Password" />
        </div>
        {this.state.calculated ?
          <div className="servicePassword">
            <div className="p-inputgroup mt-3 mb-3">
              <span className="p-inputgroup-addon"><i className="pi pi-lock"></i></span>
              <InputText className="inputtext-edit-service" type="text" value={this.state.servicePassword} name="servicePassword" onChange={this.handleChange} 
                placeholder="Service-Password" readOnly />
            </div>
            <Button icon="pi pi-copy" onClick={this.handleCopyToClipboard} tooltip={'Copy Password'} tooltipOptions={defaultTooltipOptions} />
            <Button icon="pi pi-trash" onClick={this.handleClearPassword} tooltip={'Clear Password'} tooltipOptions={defaultTooltipOptions} />
          </div> :
          <Button label="Calculate Password" style={{ marginRight: '.25em' }} onClick={this.handleGeneratePassword} />}
      </div>
    );
  }
}

export default PasswordDemo;