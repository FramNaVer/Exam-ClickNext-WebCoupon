const authService = require('../services/authService');
const logActivity = require('../services/logService');

exports.registerUser = async (req, res, next) => {
    try {
        const result = await authService.register(req.body);

        logActivity({
            level: 'info',
            action: 'USER_REGISTER',
            actorId: result.user.id,
            actorName: result.user.username,
            message: `${result.user.username} registered successfully`,
            ipAddress: req.ip
        });

        return res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

exports.loginUser = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);

        logActivity({
            level: 'info',
            action: 'USER_LOGIN',
            actorId: result.user.id,
            actorName: result.user.username,
            message: `${result.user.username} logged in successfully`,
            ipAddress: req.ip
        });

        return res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.refresh(refreshToken);
        return res.json(result);
    } catch (error) {
        next(error);
    }
};

exports.logoutUser = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const result = await authService.logout(refreshToken);

        logActivity({
            level: 'info',
            action: 'USER_LOGOUT',
            actorId: result.user.id,
            actorName: result.user.username,
            message: `${result.user.username} logged out successfully`,
            ipAddress: req.ip
        });

        return res.json(result);
    } catch (error) {
        next(error);
    }
};

