import React from 'react';
import './charPicklist.component.sass';
import { PickList } from 'primereact/picklist';

class CharPicklist extends React.Component {

  constructor(props) {
    super(props);
    if (this.props.newService) {
      this.state = {
        source: [],
        target: []
      }
    } else {
      this.state = {
        source: this.props.whitelist,
        target: this.props.blacklist
      }
    }
  }

  componentDidMount() {
    this.setState({ source: this.props.whitelist });
  }

  itemTemplate = (char) => {
    return (
      <div>{char}</div>
    );
  }

  handleOnChange = (e) => {
    this.setState({ source: e.source, target: e.target })
    this.props.handleCharListChanges(e.source, e.target);
  }

  render() {
    return (
      <div className="charPicklist">
        <PickList source={this.state.source} target={this.state.target} itemTemplate={this.itemTemplate}
          onChange={this.handleOnChange} responsive={true} 
          sourceHeader="WhiteList" targetHeader="BlackList" showSourceControls={false} showTargetControls={false} />
      </div>
    );
  }
}

export default CharPicklist;