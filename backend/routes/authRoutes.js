const express = require('express');
const routes = express.Router();
const { registerUser, loginUser, refreshToken, logoutUser } = require('../controllers/authController');

routes.post('/register', registerUser);
routes.post('/login', loginUser);
routes.post('/refresh', refreshToken);
routes.post('/logout', logoutUser);

module.exports = routes;