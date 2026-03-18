const express = require('express');
const routes = express.Router();
const { getAllRewards } = require('../controllers/rewardsController');
const { authMiddleware } = require('../middleware/authMiddleware');

routes.get('/', authMiddleware, getAllRewards);

module.exports = routes;