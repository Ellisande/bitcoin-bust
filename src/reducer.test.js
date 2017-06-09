import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { buyReducer, sellReducer, buy, sell } from './App';

const beginningState = Object.freeze({
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
});

describe('buy', () => {
  it('will not let me spend more USD than I have', () => {

  });
  it('reduces my USD amount by the amount requested', () => {
    const action = buy(100);
    const newState = buyReducer(beginningState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(1900);
  });
  it('increases my BTC by the amount USD / the current bitcoin price', () => {
    const buyAmount = 100;
    const action = buy(buyAmount);
    const newState = buyReducer(beginningState, action);
    const me = newState.users.justin;
    expect(me.btc).toEqual(buyAmount * beginningState.exchange.price);
  });
  it('rounds down if I provide a USD value that would result in a partial coin', () => {
    const testState = _.merge({}, beginningState, { exchange: { price: 3 } });
    const buyAmount = 100;
    const action = buy(buyAmount);
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.btc).toEqual(Math.floor(buyAmount * beginningState.exchange.price));
  });
  it('should not charge me for bitcoin I could not afford', () => {
    const testState = _.merge({}, beginningState, { exchange: { price: 3 } });
    const buyAmount = 100;
    const action = buy(buyAmount);
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(1901);
  });
  it('will not allow me to buy coins the exchange does not have', () => {
    const testState = _.merge({}, beginningState, { exchange: { totalCoins: 0 } });
    const buyAmount = 100;
    const action = buy(buyAmount);
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(2000);
    expect(me.btc).toEqual(0);
  });

})

describe('sell', () => {
  it('will not let me sell more bitcoin then I have', () => {

  });
  it('increases my USD amount by the number of coins sold * the current price', () => {

  });
  it('reduces my BTC by the amount provided', () => {

  });
});
