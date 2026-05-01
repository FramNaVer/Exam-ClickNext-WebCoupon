const AppError = require('../utils/appError');
const adminService = require('../services/adminService'); // For user management
const rewardsService = require('../services/rewardsService'); // For reward management
const uploadService = require('../services/uploadService'); // For image uploads
const logActivity = require('../services/logService');

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
        const oldUser = await adminService.getUserById(id);
        const user = await adminService.updateUserRole(id, role);

        logActivity({
            level: 'info',
            action: 'USER_ROLE_UPDATE',
            actorId: req.user.id,
            actorName: req.user.username,
            targetType: 'user',
            targetId: Number(id),
            message: `Role of ${user.username} changed to ${role}`,
            metadata: { oldRole: oldUser?.role, newRole: role },
            ipAddress: req.ip
        })

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

        logActivity({
            level: 'info',
            action: 'USER_POINTS_UPDATE',
            actorId: req.user.id,
            actorName: req.user.username,
            targetType: 'user',
            targetId: user.id,
            message: `Points of ${user.username} updated to ${points}`,
            metadata: { newPoints: points },
            ipAddress: req.ip
        });
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
        const rewardData = { ...req.body };

        // If a file is uploaded, upload it to Cloudinary and get the URL
        if (req.file) {
            const uploadResult = await uploadService.uploadImageStream(req.file);
            rewardData.image_url = uploadResult.secure_url;
            rewardData.public_id = uploadResult.public_id;
        }

        const reward = await rewardsService.createReward(rewardData);
        logActivity({
            level: 'info',
            action: 'REWARD_CREATED',
            actorId: req.user.id,
            actorName: req.user.username,
            targetType: 'reward',
            targetId: reward.id,
            message: `Reward ${reward.title} created`,
            ipAddress: req.ip
        });
        res.status(201).json({ success: true, reward });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/admin/rewards/:id
exports.updateReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        const rewardData = { ...req.body };

        if (req.file) {
            // To prevent orphaned images, first find the existing reward
            const existingReward = await rewardsService.getRewardsById(Number(id));

            // Then, upload the new image
            const uploadResult = await uploadService.uploadImageStream(req.file);
            rewardData.image_url = uploadResult.secure_url;
            rewardData.public_id = uploadResult.public_id;

            // If the old reward had an image, delete it from Cloudinary
            if (existingReward && existingReward.public_id) {
                await uploadService.deleteImage(existingReward.public_id);
            }
        }

        const reward = await rewardsService.updateReward(id, rewardData);

        logActivity({
            level: 'info',
            action: 'REWARD_UPDATED',
            actorId: req.user.id,
            actorName: req.user.username,
            targetType: 'reward',
            targetId: reward.id,
            message: `Reward ${reward.title} updated`,
            ipAddress: req.ip
        });

        res.json({ success: true, reward });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/logs
exports.getLogs = async (req, res, next) => {
    try {
        const { page, limit, level, action, startDate, endDate } = req.query;
        const result = await adminService.getLogs({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 20,
            level: level || undefined,
            action: action || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
        });
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/rewards/:id
exports.deleteReward = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Fetch the reward to get its public_id before deleting from DB
        const rewardToDelete = await rewardsService.getRewardsById(Number(id));
        if (rewardToDelete && rewardToDelete.public_id) {
            await uploadService.deleteImage(rewardToDelete.public_id);
        }

        await rewardsService.deleteReward(id);
        logActivity({
            level: 'warn',
            action: 'REWARD_DELETED',
            actorId: req.user.id,
            actorName: req.user.username,
            targetType: 'reward',
            targetId: Number(id),
            message: `Reward ${rewardToDelete.title} deleted`,
            ipAddress: req.ip
        });

        res.json({ success: true, message: 'Reward deleted' });
    } catch (error) {
        next(error);
    }
};


