const authService = require('../services/authService');

exports.registerUser = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);
        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

