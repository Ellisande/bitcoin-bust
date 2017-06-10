import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import './App.css';
import { buy, sell, heatup, cooldown } from './actions';
import { combinedReducer } from './reducers';
import PriceChart from './PriceChart';
import Robot from './Robot';

const store = createStore(combinedReducer, undefined, window && window.devToolsExtension && window.devToolsExtension());

class ShowExchangePure extends Component {
  constructor(props){
    super(props);
    this.state = {
      history: [],
    }
  }
  render() {
    const [last = 0, current = 0] = this.props.history.slice(-2);
    const direction = last.price - current.price > 0 ? 'down' : 'up';
    const data = this.props.history.map((price, index) => ({y: price.price, x: price.time}));
    return (
      <div>
        <div>BTC Rate {this.props.price.toFixed(2)}</div>
        <div className="tiny">Available Coins {this.props.totalCoins.toFixed(2)}</div>
        <button onClick={() => this.props.buy(this.props.usd * 0.1)}>Buy</button>
        <button onClick={() => this.props.sell(Math.floor(this.props.btc * 0.1))}>Sell</button>
        <div>BTC: {this.props.btc.toFixed(2)}</div>
        <div>USD: {this.props.usd.toFixed(2)}</div>
        <div>{direction}</div>
        <PriceChart data={data} />
        <Robot />
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


class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      price: 0,
      totalCoins: 10000,
    }
    this.update = this.update.bind(this);
  }
  update(price, totalCoins) {
    this.setState({
      price,
      totalCoins
    });
  }
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <ShowExchange />
        </div>
      </Provider>
    );
  }
}

export default App;
