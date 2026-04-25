const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');
const cloudinary = require('../lib/cloudinary');
const adminService = require('../services/adminService'); // For user management
const rewardsService = require('../services/rewardsService'); // For reward management

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await adminService.getUsers();
        res.json({ success: true, users });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/admin/users/:id/role
exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await adminService.updateUserRole(id, role);
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/admin/users/:id/points
exports.updateUserPoints = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { points } = req.body;
        const user = await adminService.updateUserPoints(id, points);
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/rewards
exports.getRewards = async (req, res, next) => {
    try {
        const rewards = await rewardsService.getAllRewardsForAdmin();
        res.json({ success: true, rewards });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/rewards
exports.createReward = async (req, res, next) => {
    try {
        const reward = await rewardsService.createReward(req.body);
        res.status(201).json({ success: true, reward });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/upload-image
exports.uploadImage = async (req, res, next) => {
    try {
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            throw new AppError('Cloudinary is not configured', 500);
        }

        if (!req.file) {
            throw new AppError('Image file is required', 400);
        }

        const uploadResult = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: 'snapreward/rewards',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );

            stream.end(req.file.buffer);
        });

        res.status(201).json({
            success: true,
            image_url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/admin/rewards/:id
exports.updateReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        const reward = await rewardsService.updateReward(id, req.body);
        res.json({ success: true, reward });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/rewards/:id
exports.deleteReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        await rewardsService.deleteReward(id);
        res.json({ success: true, message: 'Reward deleted' });
    } catch (error) {
        next(error);
    }
};
