import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { buy, sell } from './actions';

class Robot extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount(){
    this.makeTrade();
  }
  makeTrade(){
    const { btc, usd } = this.props.users.robot;
    const randomMove = Math.random() >= 0.5 ? buy.bind(undefined, Math.floor(Math.random() * usd)) : sell.bind(undefined, Math.floor(Math.random() * btc));
    this.props.dispatch(randomMove('robot'));
    setTimeout(this.makeTrade.bind(this), 1000)
  }
  render() {
    return (
      <div className="">

      </div>
    );
  }
}

Robot.propTypes = {

};

export default connect(i=>i)(Robot);
