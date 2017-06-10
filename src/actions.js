const buy = (amount, user) => ({
  type: 'BUY',
  amount,
  user,
});

const sell = (amount, user) => ({
  type: 'SELL',
  amount,
  user,
});

const heatup = () => ({
  type: 'HEAT_UP',
});

const cooldown = () => ({
  type: 'COOL_DOWN',
});

export {
  buy,
  sell,
  heatup,
  cooldown,
};
