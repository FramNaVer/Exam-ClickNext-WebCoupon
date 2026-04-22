const authRoutes    = require('./authRoutes');
const userRoutes    = require('./userRoutes');
const rewardRoutes  = require('./rewardsRoutes');
const redeemRoutes  = require('./redeemRoutes');
const adminRoutes   = require('./adminRoutes');
const { authLimiter } = require('../middleware/ratelimiter');

const setupRoutes = (app) => {
  app.use('/api/auth',    authLimiter, authRoutes);
  app.use('/api/user',    userRoutes);
  app.use('/api/rewards', rewardRoutes);
  app.use('/api/redeem',  redeemRoutes);
  app.use('/api/admin',   adminRoutes);
};

module.exports = setupRoutes;
