import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';
import { buyReducer, sellReducer } from './reducers';
import { buy, sell } from './actions';

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
    const testState = _.merge({}, beginningState, { users: { justin: { usd: 50, btc: 0 } } });
    const buyAmount = 100;
    const action = buy(buyAmount, 'justin');
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.btc).toEqual(50);
    expect(me.usd).toEqual(0);
  });
  it('reduces my USD amount by the amount requested', () => {
    const action = buy(100, 'justin');
    const newState = buyReducer(beginningState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(1900);
  });
  it('increases my BTC by the amount USD / the current bitcoin price', () => {
    const buyAmount = 100;
    const action = buy(buyAmount, 'justin');
    const newState = buyReducer(beginningState, action);
    const me = newState.users.justin;
    expect(me.btc).toEqual(buyAmount * beginningState.exchange.price);
  });
  it('rounds down if I provide a USD value that would result in a partial coin', () => {
    const testState = _.merge({}, beginningState, { exchange: { price: 3 } });
    const buyAmount = 100;
    const action = buy(buyAmount, 'justin');
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.btc).toEqual(Math.floor(buyAmount / testState.exchange.price));
  });
  it('should not charge me for bitcoin I could not afford', () => {
    const testState = _.merge({}, beginningState, { exchange: { price: 3 } });
    const buyAmount = 100;
    const action = buy(buyAmount, 'justin');
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(1901);
  });
  it('will not allow me to buy coins the exchange does not have', () => {
    const testState = _.merge({}, beginningState, { exchange: { totalCoins: 0 } });
    const buyAmount = 100;
    const action = buy(buyAmount, 'justin');
    const newState = buyReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(2000);
    expect(me.btc).toEqual(0);
  });
  it('should increase the price', () => {
    const buyAmount = 100;
    const action = buy(buyAmount, 'justin');
    const newState = buyReducer(beginningState, action);
    const newPrice = newState.exchange.price;
    expect(newPrice).toBeGreaterThan(1);
  });
  describe.skip('basic increase algorithm', () => {
    it('should increase the price', () => {
      const buyAmount = 100;
      const action = buy(buyAmount, 'justin');
      const newState = buyReducer(beginningState, action);
      const nextState = buyReducer(newState, action);
      const newPrice = nextState.exchange.price;
      expect(newPrice).toBe(1.0298);
    });
  });
})

describe('sell', () => {
  it('will not let me sell more bitcoin then I have', () => {
    const testState = _.merge({}, beginningState, { users: { justin: { usd: 0, btc: 0} } });
    const sellAmount = 100;
    const action = sell(sellAmount, 'justin');
    const newState = sellReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(0);
    expect(me.btc).toEqual(0);
  });
  it('increases my USD amount by the number of coins sold * the current price', () => {
    const testState = _.merge({}, beginningState, { users: { justin: { usd: 0, btc: 100} } });
    const sellAmount = 100;
    const action = sell(sellAmount, 'justin');
    const newState = sellReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(100);
    expect(me.btc).toEqual(0);
  });
  it('reduces my BTC by the amount provided', () => {
    const testState = _.merge({}, beginningState, { users: { justin: { usd: 0, btc: 100} } });
    const sellAmount = 100;
    const action = sell(sellAmount, 'justin');
    const newState = sellReducer(testState, action);
    const me = newState.users.justin;
    expect(me.usd).toEqual(100);
    expect(me.btc).toEqual(0);
  });
  it('should reduce the price', () => {
    const testState = _.merge({}, beginningState, { users: { justin: { usd: 0, btc: 100} } });
    const sellAmount = 100;
    const action = sell(sellAmount, 'justin');
    const newState = sellReducer(testState, action);
    const newPrice = newState.exchange.price;
    expect(newPrice).toBeLessThan(1);
  });
  it('should not allow the price to go below 0', () => {
    const testState = _.merge({}, beginningState, { exchange: { price: 0 } });
    const sellAmount = 100;
    const action = sell(sellAmount, 'justin');
    const newState = sellReducer(testState, action);
    const newPrice = newState.exchange.price;
    expect(newPrice).toBeLessThan(1);
  });
  describe.skip('basic decrease algorithm', () => {

  });

});
