const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const authMiddleware = (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Access token missing', 401);
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        next();
    }catch (error) {
        next(error);
    }
}

module.exports = { authMiddleware };