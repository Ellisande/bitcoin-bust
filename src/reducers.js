const coinsInCirculation = 10000;

const buyReducer = (state, action) => {
  const newState = Object.assign({}, state);
  const userUsd = newState.users[action.user].usd;
  const buyPrice = newState.exchange.price;
  const amountAvailable = action.amount > userUsd ? userUsd : action.amount;
  const amountDesired = Math.floor(amountAvailable / newState.exchange.price);
  const amountPurchased = amountDesired <= newState.exchange.totalCoins ? amountDesired : newState.exchange.totalCoins;
  const totalCost = amountPurchased * newState.exchange.price;
  const purchaseAsFractionOfTotal = (newState.exchange.totalCoins - amountPurchased) / coinsInCirculation;
  const { buysPerSecond } = newState.exchange;
  const velocity = (buysPerSecond - 10 > 0 ? buysPerSecond - 10 * 0.1 : 0.1);
  const newPrice = newState.exchange.price + velocity;
  const newTotalCoins = newState.exchange.totalCoins - amountPurchased;
  const newBps = newState.exchange.buysPerSecond + 1;
  newState.exchange = {
    price: newPrice,
    totalCoins: newTotalCoins,
    buysPerSecond: newBps,
    sellsPerSecond: newState.exchange.sellsPerSecond,
    history: [...newState.exchange.history, { price: newPrice, time: new Date() }],
  };
  newState.users = Object.assign({}, newState.users, {
    [action.user]: {
      btc: newState.users[action.user].btc + amountPurchased,
      usd: newState.users[action.user].usd - totalCost,
    }
  });
  return newState;
}

const sellReducer = (state, action) => {
  const newState = Object.assign({}, state);
  const userBtc = newState.users[action.user].btc;
  const amountToSell = action.amount > userBtc ? userBtc : action.amount;
  const sellPrice = newState.exchange.price;
  const wantedNewPrice = newState.exchange.price * 0.7;
  const newPrice = wantedNewPrice > 0 ? wantedNewPrice : 0.1;
  const newTotalCoins = newState.exchange.totalCoins + amountToSell;
  const newSps = newState.exchange.sellsPerSecond + 1;
  newState.exchange = {
    price: newPrice,
    totalCoins: newTotalCoins,
    buysPerSecond: newState.exchange.buysPerSecond,
    sellsPerSecond: newSps,
    history: [...newState.exchange.history, { price: newPrice, time: new Date() }],
  };
  newState.users = Object.assign({}, newState.users, {
    [action.user]: {
      btc: newState.users[action.user].btc - amountToSell,
      usd: newState.users[action.user].usd + (amountToSell * sellPrice),
    }
  })
  return newState;
};

const combinedReducer = (state = {
  exchange: {
    price: 1,
    totalCoins: coinsInCirculation,
    buysPerSecond: 1,
    sellsPerSecond: 1,
    history: [],
  },
  users: {
    justin: {
      btc: 0,
      usd: 2000,
    },
    robot: {
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
  return newState;
}

export {
  buyReducer,
  sellReducer,
  combinedReducer,
};
