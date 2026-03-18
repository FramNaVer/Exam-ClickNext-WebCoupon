const express = require('express');
const routes = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

routes.get('/profile', authMiddleware, getUserProfile);
routes.put('/profile', authMiddleware, updateUserProfile);

module.exports = routes;