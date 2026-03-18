const express = require('express');
const routes = express.Router();
const { getAllRewards, getRewardById } = require('../controllers/rewardsController');
const { authMiddleware } = require('../middleware/authMiddleware');

routes.get('/', authMiddleware, getAllRewards);
routes.get('/:id', authMiddleware, getRewardById);

module.exports = routes;