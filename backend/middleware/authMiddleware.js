const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Access token missing', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        next(error);
    }
}

const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) return next(new AppError('Unauthorized', 401));
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Forbidden: insufficient permissions', 403));
        }
        next();
    }
}

module.exports = { authMiddleware, requireRole };