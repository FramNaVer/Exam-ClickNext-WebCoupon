const express = require('express');
const routes = express.Router();
const { redeemReward, getRedemptionHistory } = require('../controllers/redeemrewardController');
const { authMiddleware } = require('../middleware/authMiddleware');

routes.post('/:id', authMiddleware, redeemReward);
routes.get('/history', authMiddleware, getRedemptionHistory);

module.exports = routes;