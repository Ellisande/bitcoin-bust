import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import numbro from 'numbro';
import _ from 'lodash';
import './App.css';
import { buy, sell, heatup, cooldown } from './actions';
import { combinedReducer } from './reducers';
import PriceChart from './PriceChart';
import { store } from './store';
import { withData, withDataUpdate, withIncreasePrice, withDecreasePrice, withUserData, withUpdateUserData, withAddUser, withHistory } from './withFirebase';

const BTC = props => <span className="btc">{numbro(props.value).format('0,0')}Ƀ</span>;
const USD = props => <span className="usd">{numbro(props.value).format('$0,0.00')}</span>;

const DisplayExchange = props =>
  <div className="exchange">
    <div className=""><BTC value={1} /> = <USD value={props.price || 1}/></div>
  </div>;

const PureBuyButton = props => {
  const amountToSpend = _.min([Math.floor((props.usd * 0.5) / props.price) * props.price, 100 * props.price]);
  const buyAction = (usdToSpend) => {
    if(usdToSpend <= 0 || usdToSpend >= props.usd || usdToSpend / props.price < 1){
      return;
    }
    props.updateUsd( oldUsd => oldUsd - usdToSpend );
    props.updateBtc( oldBtc => oldBtc + Math.floor(usdToSpend / props.price));
    props.increasePrice();
  };
  return (
    <div className="buy">
      <button className="trade" onClick={() => buyAction(amountToSpend)}>Ƀuy</button>
      <div><BTC value={amountToSpend / props.price} /></div>
      <div><USD value={-amountToSpend} /></div>
    </div>
  )
}

const BuyButton = _.flow(
  withUserData('usd', 'usd'),
  withUpdateUserData('btc', 'updateBtc'),
  withUpdateUserData('usd', 'updateUsd'),
  withDataUpdate('exchange/price', 'updatePrice'),
  withIncreasePrice,
)(PureBuyButton);


const PureSellButton = props => {
  const amountToSell = _.min([Math.floor(props.btc * 0.5), 100])
  const sellAction = (btcToSell) => {
    if(btcToSell <= 0 || btcToSell > props.btc){
      return;
    }
    props.updateUsd( oldUsd => oldUsd + (btcToSell * props.price));
    props.updateBtc( oldBtc => oldBtc - btcToSell);
    props.decreasePrice();
  };
  return (
    <div className="sell">
      <button className="trade" onClick={() => sellAction(amountToSell)}>$ell</button>
      <div><BTC value={-amountToSell}/></div>
      <div><USD value={amountToSell * props.price} /></div>
    </div>
  )
};

const SellButton = _.flow(
  withUserData('btc', 'btc'),
  withUpdateUserData('usd', 'updateUsd'),
  withUpdateUserData('btc', 'updateBtc'),
  withDataUpdate('exchange/price', 'updatePrice'),
  withDecreasePrice,
)(PureSellButton);

const PurePlayer = props =>
  <div className="player">
    <div>{props.user}'s Wallet</div>
    <div><BTC value={props.btc} /></div>
    <div><USD value={props.usd}/></div>
  </div>;

const Player = _.flow(
  withUserData('btc', 'btc'),
  withUserData('usd', 'usd'),
)(PurePlayer);


class PurePlayArea extends Component {
  constructor(props){
    super(props);
    this.state = {
      history: [],
    }
  }
  render() {
    return (
      <div className="screen">
        <DisplayExchange price={this.props.price}/>
        <PriceChart />
        <Player user={this.props.user} />
        <div className="action">
          <BuyButton user={this.props.user} price={this.props.price} />
          <SellButton user={this.props.user} price={this.props.price} />
        </div>
      </div>
    );
  }
}

const PlayArea = withData('exchange/price', 'price')(PurePlayArea);

class PureSetName extends Component {
  constructor(props){
    super(props);
    this.state = {
      userName: ''
    };
  }
  render(){
    const onSubmit = () => {
      this.props.addUser(this.state.userName);
      this.props.setName(this.state.userName);
    }
    return (
      <form className="enter-name" onSubmit={onSubmit}>
        <h2>Welcome to Ƀitcoin Ƀust!</h2>
        <label>Enter Your Name:</label>
        <input autoFocus pattern="[a-zA-Z_ ]+" onChange={e => this.setState({userName: e.target.value.replace(/ /g, '_')})}/>
        <button className="play-button" type="submit">Play</button>
      </form>
    );
  }
}

const SetName = withAddUser(PureSetName);


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      user: undefined,
    };
  }
  render() {
    if(!this.state.user){
      return <SetName setName={name => this.setState({user: name})} />
    }
    return (
      <Provider store={store}>
        <div className="App">
          <PlayArea user={this.state.user} />
        </div>
      </Provider>
    );
  }
}

export default App;
