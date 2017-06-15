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

const DisplayExchange = withData('exchange')(({exchange}) => {
  const price = exchange.price || 1;
  const totalCoins = exchange.totalCoins || 0;
  return (
    <div className="exchange">
      <div className="">BTC Rate {price.toFixed(2)}</div>
      <div className="tiny">Available Coins {totalCoins.toFixed(2)}</div>
    </div>
  );
});

const PureBuyButton = props => {
  const buyOption = Math.floor(props.usd * 0.1 / props.price);
  const amountToBuy = _.min([props.usd * 0.1, 100 * props.price]);
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
      <button className="trade" onClick={() => buyAction(props.usd * 0.1)}>Buy</button>
      <div>{numbro(amountToBuy / props.price).format('+0,0')} BTC</div>
      <div>{numbro(amountToBuy).format('-$0,0.00')} USD</div>
    </div>
  )
}

const BuyButton = _.flow(
  withData('exchange/price', 'price'),
  withUserData('usd', 'usd'),
  withUpdateUserData('btc', 'updateBtc'),
  withUpdateUserData('usd', 'updateUsd'),
  withDataUpdate('exchange/price', 'updatePrice'),
  withIncreasePrice,
)(PureBuyButton);


const PureSellButton = props => {
  const sellOption = numbro((Math.floor(props.btc * 0.1) || 1) * props.price).format('$0,0.00');
  const amountToSell = function(){
    const tenPercent = Math.floor(props.btc * 0.1);
    if(props.btc === 0) return 0;
    if(tenPercent >= 1 && tenPercent < 100) return tenPercent;
    if(tenPercent < 1 && props.btc > 1) return 1;
    return 100;
  }();
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
      <button className="trade" onClick={() => sellAction(Math.floor(props.btc * 0.1) || 1)}>Sell</button>
      <div>{numbro(amountToSell).format('-0,0')} BTC</div>
      <div>{numbro(amountToSell * props.price).format('+$0,0.00')} USD</div>
    </div>
  )
};

const SellButton = _.flow(
  withData('exchange/price', 'price'),
  withUserData('btc', 'btc'),
  withUpdateUserData('usd', 'updateUsd'),
  withUpdateUserData('btc', 'updateBtc'),
  withDataUpdate('exchange/price', 'updatePrice'),
  withDecreasePrice,
)(PureSellButton);

const PurePlayer = props =>
  <div className="player">
    <div>BTC: {numbro(props.btc).format('0,0')}</div>
    <div>USD: {numbro(props.usd).format('$0,0.00')}</div>
  </div>;

const Player = _.flow(
  withUserData('btc', 'btc'),
  withUserData('usd', 'usd'),
)(PurePlayer);


class ShowExchangePure extends Component {
  constructor(props){
    super(props);
    this.state = {
      history: [],
    }
  }
  render() {
    return (
      <div className="screen">
        <DisplayExchange />
        <div className="action">
          <BuyButton user={this.props.user} />
          <SellButton user={this.props.user} />
        </div>
        <Player user={this.props.user} />
        <PriceChart />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  buy: (amount) => {
      if(props.usd > amount * props.price || amount > props.totalCoins || amount < 1){
        return;
      }
      dispatch(buy(amount, 'justin'));
      setTimeout(() => dispatch(cooldown()), 3000);
  },
  sell: (amount) => {
    if(amount > props.btc) {
      return;
    }
    dispatch(sell(amount, 'justin'));
    setTimeout(() => dispatch(heatup()), 3000);
  }
})

const ShowExchange = connect(i => ({
  price: i.exchange.price,
  totalCoins: i.exchange.totalCoins,
  sellsPerSecond: i.exchange.sellsPerSecond,
  buysPerSecond: i.exchange.buysPerSecond,
  history: i.exchange.history,
  btc: i.users.justin.btc,
  usd: i.users.justin.usd,
}), mapDispatchToProps)(ShowExchangePure);

// const exchange = new Exchange();

const user = {
  btc: 0,
  usd: 2000,
};

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
      <form onSubmit={onSubmit}>
        <label>Enter Your Name:</label>
        <input onChange={e => this.setState({userName: e.target.value})}/>
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
          <ShowExchange user={this.state.user} />
        </div>
      </Provider>
    );
  }
}

export default App;
