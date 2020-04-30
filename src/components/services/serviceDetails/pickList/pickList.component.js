import React from 'react';
import './pickList.component.sass';
import { Button } from 'primereact/button';

class PickList extends React.Component {

  constructor(props) {
    super(props);
    if (this.props.newService) {
      this.state = {
        source: [],
        target: [],
        highlight_white: null,
        highlight_black: null
      }
    } else {
      this.state = {
        source: this.props.whitelist,
        target: this.props.blacklist,
        highlight_white: null,
        highlight_black: null
      }
    }
  }

  componentDidMount() {
    this.setState({ source: this.props.whitelist });
  }

  handleItemHighlightWhite = (e) => {
    // removes the 'pickList-item-highlight' class from the currently highlighted item
    if (this.state.highlight_white) {
      let temp = this.state.highlight_white;
      temp.className = 'picklist-item';
      this.setState({ highlight_white: temp });
    }

    // adds the 'pickList-item-highlight' class to the new highlighted item
    e.target.className = 'picklist-item pickList-item-highlight';
    this.setState({ highlight_white: e.target });
  }

  handleItemHighlightBlack = (e) => {
    // removes the 'pickList-item-highlight' class from the currently highlighted item
    if (this.state.highlight_black) {
      let temp = this.state.highlight_black;
      temp.className = 'picklist-item';
      this.setState({ highlight_black: temp });
    }

    // adds the 'pickList-item-highlight' class to the new highlighted item
    e.target.className = 'picklist-item pickList-item-highlight';
    this.setState({ highlight_black: e.target });
  }

  handleSingleItemWhiteBlack = () => {
    if (!this.state.highlight_white) {
      return;
    }

    let tempWhite = this.state.source;
    let tempBlack = this.state.target;

    switch (this.state.highlight_white.innerHTML) {
      case '&amp;':
        tempWhite.splice(tempWhite.indexOf('&'), 1);
        tempBlack.push('&');
        break;
      case '&lt;':
        tempWhite.splice(tempWhite.indexOf('<'), 1);
        tempBlack.push('<');
        break;
      case '&gt;':
        tempWhite.splice(tempWhite.indexOf('>'), 1);
        tempBlack.push('>');
        break;
      default:
        tempWhite.splice(tempWhite.indexOf(this.state.highlight_white.innerHTML), 1);
        tempBlack.push(this.state.highlight_white.innerHTML);
        break;
    }
    this.setState({ source: tempWhite, target: tempBlack, highlight_white: null }, () => {
      this.handleOnChange();
    });
  }

  handleSingleItemBlackWhite = () => {
    if (!this.state.highlight_black) {
      return;
    }

    let tempWhite = this.state.source;
    let tempBlack = this.state.target;

    switch (this.state.highlight_black.innerHTML) {
      case '&amp;':
        tempBlack.splice(tempBlack.indexOf('&'), 1);
        tempWhite.push('&');
        break;
      case '&lt;':
        tempBlack.splice(tempBlack.indexOf('<'), 1);
        tempWhite.push('<');
        break;
      case '&gt;':
        tempBlack.splice(tempBlack.indexOf('>'), 1);
        tempWhite.push('>');
        break;
      default:
        tempBlack.splice(tempBlack.indexOf(this.state.highlight_black.innerHTML), 1);
        tempWhite.push(this.state.highlight_black.innerHTML);
        break;
    }
    this.setState({ source: tempWhite, target: tempBlack, highlight_black: null }, () => {
      this.handleOnChange();
    });
  }

  // w2b => white to black
  handleChangeAllItems = (w2b) => {
    if (w2b && this.state.source.length > 0) {
      let temp = this.state.source;
      this.setState({ source: [], target: temp }, () => {
        this.handleOnChange();
      });
    } else if (!w2b && this.state.target.length > 0) {
      this.setState({ source: this.state.target, target: this.state.source }, () => {
        this.handleOnChange();
      });
    }
  }

  handleOnChange = () => {
    this.props.handleCharListChanges(this.state.source, this.state.target);
  }

  render() {
    return (
      <div className="pickList-container">
        <div className="pickList picklist-whitelist">
          <div className="pickList-header">WhiteList</div>
          <div className="pickList-body">
            <ul className="pickList-list">
              {this.state.source.map((char) => (
                <li key={char} className="picklist-item" onClick={this.handleItemHighlightWhite}>{char}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="pickList-button-container">
          <Button className="pickList-button" icon="pi pi-angle-right" onClick={this.handleSingleItemWhiteBlack}></Button>
          <Button className="pickList-button" icon="pi pi-angle-double-right" onClick={() => { this.handleChangeAllItems(true) }}></Button>
          <Button className="pickList-button" icon="pi pi-angle-left" onClick={this.handleSingleItemBlackWhite}></Button>
          <Button className="pickList-button" icon="pi pi-angle-double-left" onClick={() => { this.handleChangeAllItems(false) }}></Button>
        </div>
        <div className="pickList picklist-blacklist">
          <div className="pickList-header">BlackList</div>
          <div className="pickList-body">
            <ul className="pickList-list">
              {this.state.target.map((char) => (
                <li key={char} className="picklist-item" onClick={this.handleItemHighlightBlack}>{char}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default PickList;