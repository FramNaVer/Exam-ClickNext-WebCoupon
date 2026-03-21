const authRoutes    = require('./authRoutes');
const userRoutes    = require('./userRoutes');
const rewardRoutes  = require('./rewardsRoutes');
const redeemRoutes  = require('./redeemRoutes');

const setupRoutes = (app) => {
  app.use('/api/auth',    authRoutes);
  app.use('/api/user',    userRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/redeem',  redeemRoutes);
};

module.exports = setupRoutes;
