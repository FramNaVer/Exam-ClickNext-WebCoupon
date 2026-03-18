const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');
const { getUserProfile , updateUserProfile} = require('../services/userService');

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await getUserProfile(req.user.id);

        return res.json({ success: true, user });

    } catch (error) {
        next(error);
    }
};

exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await updateUserProfile(req.user.id, req.body);

        return res.json({ success: true, user });

    } catch (error) {
        next(error);
    }
};
