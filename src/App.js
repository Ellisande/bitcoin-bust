import React, { Component } from 'react';
import { Provider, connect } from 'react-redux';
import { createStore, combineReducers } from 'redux';
import './App.css';
import PriceChart from './PriceChart';

const buyReducer = (state, action) => {
  const newState = Object.assign({}, state);
  const buyPrice = newState.exchange.price;
  const amountPurchased = newState.exchange.totalCoins - action.amount >= 0 ? action.amount : newState.exchange.totalCoins;
  const newPrice = newState.exchange.price * 1 + (amountPurchased / 10000) * newState.exchange.buysPerSecond;
  const newTotalCoins = newState.exchange.totalCoins - amountPurchased;
  const newBps = newState.exchange.buysPerSecond + 1;
  newState.exchange = {
    price: newPrice,
    totalCoins: newTotalCoins,
    buysPerSecond: newBps,
    sellsPerSecond: newState.exchange.sellsPerSecond,
    history: [...newState.exchange.history, { price: newPrice, time: new Date() }],
  };
  return newState;
}

const sellReducer = (state, action) => {
  const newState = Object.assign({}, state);
  const sellPrice = newState.exchange.price;
  const newPrice = newState.exchange.price * 1 - (action.amount / 10000) * newState.exchange.sellsPerSecond;
  const newTotalCoins = newState.exchange.totalCoins + action.amount;
  const newSps = newState.exchange.sellsPerSecond + 1;
  newState.exchange = {
    price: newPrice,
    totalCoins: newTotalCoins,
    buysPerSecond: newState.exchange.buysPerSecond,
    sellsPerSecond: newSps,
    history: [...newState.exchange.history, { price: newPrice, time: new Date() }],
  };
  return newState;
}

const combinedReducer = (state = {
  exchange: {
    price: 1,
    totalCoins: 10000,
    buysPerSecond: 1,
    sellsPerSecond: 1,
    history: [],
  },
  users: {
    justin: {
      btc: 0,
      usd: 2000,
    }
  }
}, action) => {
  let newState = Object.assign({}, state);
  if(action.type === 'BUY'){
    newState = buyReducer(newState, action);
  }
  if(action.type === 'SELL'){
    newState = sellReducer(newState, action);
  }
  if(action.type === 'COOL_DOWN'){
    newState.exchange = Object.assign({}, newState.exchange, {
      buysPerSecond: newState.exchange.buysPerSecond - 1,
    });
  }
  if(action.type === 'HEAT_UP'){
    newState.exchange = Object.assign({}, newState.exchange, {
      sellsPerSecond: newState.exchange.sellsPerSecond - 1,
    });
  }
  if(action.type === 'ADD'){
    newState.users = Object.assign({}, newState.users, {[action.userName]: {btc: 0, usd: 2000}});
  }
  if(action.type === 'BUY'){
    newState.users = Object.assign({}, newState.users, {
      [action.user]: {
        btc: newState.users[action.user].btc + action.amount,
        usd: newState.users[action.user].usd - (action.amount * newState.exchange.price),
      }
    })
  }
  if(action.type === 'SELL'){
    newState.users = Object.assign({}, newState.users, {
      [action.user]: {
        btc: newState.users[action.user].btc - action.amount,
        usd: newState.users[action.user].usd + (action.amount * newState.exchange.price),
      }
    })
  }
  return newState;
}



const store = createStore(combinedReducer, undefined, window && window.devToolsExtension());

const buy = (amount, user) => ({
  type: 'BUY',
  amount,
  user: 'justin',
});

const sell = (amount, user) => ({
  type: 'SELL',
  amount,
  user: 'justin',
});

const heatup = () => ({
  type: 'HEAT_UP',
});

const cooldown = () => ({
  type: 'COOL_DOWN',
});

// class Exchange {
//   constructor(){
//     this.price = 1;
//     this.totalCoins = 10000
//     this.buy = this.buy.bind(this);
//     this.sell = this.sell.bind(this);
//     this.subscriptions = [];
//     this.buysPerSecond = 1.0;
//     this.sellsPerSecond = 1.0;
//   }
//   buy(amount) {
//     this.props.dispatch(buy(amount));
//     setTimeout(1000, () => this.dispatch(cooldown()));
//   }
//   sell(amount) {
//     this.props.dispatch(sell(amount));
//     setTimeout(1000, () => this.dispatch(heatup()));
//   }
//   subscribe(func){
//     this.subscriptions.push(func);
//   }
//   update(price, totalCoins, buysPerSecond, sellsPerSecond){
//     this.subscriptions.forEach( subscription => subscription(price, totalCoins, buysPerSecond, sellsPerSecond));
//   }
// }

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
        <div>Current price is {this.props.price.toFixed(2)}</div>
        <div>Coins held is {this.props.totalCoins.toFixed(2)}</div>
        <div>BPS: {this.props.buysPerSecond} SPS: {this.props.sellsPerSecond}</div>
        <button onClick={() => this.props.buy(Math.floor(this.props.usd / this.props.price))}>All In</button>
        <button onClick={() => this.props.buy(Math.floor(this.props.usd * 0.1 / this.props.price))}>Buy</button>
        <button onClick={() => this.props.sell(Math.floor(this.props.btc * 0.1))}>Sell</button>
        <button onClick={() => this.props.sell(this.props.btc)}>Cash Out</button>
        <div>User btc: {this.props.btc.toFixed(2)}</div>
        <div>User usd: {this.props.usd.toFixed(2)}</div>
        <div>{direction}</div>
        <PriceChart data={data} />
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch, props) => ({
  buy: (amount) => {
      if(props.usd > amount * props.price || amount > props.totalCoins || amount < 1){
        return;
      }
      dispatch(buy(amount));
      setTimeout(() => dispatch(cooldown()), 3000);
  },
  sell: (amount) => {
    if(amount > props.btc) {
      return;
    }
    dispatch(sell(amount));
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
export {
  buyReducer,
  sellReducer,
}
