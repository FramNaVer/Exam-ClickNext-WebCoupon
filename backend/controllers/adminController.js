const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');
const cloudinary = require('../lib/cloudinary');

// GET /api/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, role: true, provider: true, points: true, created_at: true },
            orderBy: { created_at: 'desc' },
        });
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

        if (!['user', 'admin'].includes(role)) {
            throw new AppError('Invalid role', 400);
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { role },
            select: { id: true, username: true, role: true },
        });
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

        if (typeof points !== 'number') {
            throw new AppError('Points must be a number', 400);
        }

        const user = await prisma.user.update({
            where: { id: Number(id) },
            data: { points },
            select: { id: true, username: true, points: true },
        });
        res.json({ success: true, user });
    } catch (error) {
        next(error);
    }
};

// GET /api/admin/rewards
exports.getRewards = async (req, res, next) => {
    try {
        const rewards = await prisma.reward.findMany({ orderBy: { created_at: 'desc' } });
        res.json({ success: true, rewards });
    } catch (error) {
        next(error);
    }
};

// POST /api/admin/rewards
exports.createReward = async (req, res, next) => {
    try {
        const { title, description, points_required, image_url, expiry_date, redeem_start_date, redeem_end_date, terms_condition, stock } = req.body;

        const reward = await prisma.reward.create({
            data: {
                title, description, points_required, image_url,
                expiry_date: new Date(expiry_date),
                redeem_start_date: new Date(redeem_start_date),
                redeem_end_date: new Date(redeem_end_date),
                terms_condition,
                stock,
            },
        });
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
        const data = { ...req.body };
        if (data.expiry_date) data.expiry_date = new Date(data.expiry_date);
        if (data.redeem_start_date) data.redeem_start_date = new Date(data.redeem_start_date);
        if (data.redeem_end_date) data.redeem_end_date = new Date(data.redeem_end_date);

        const reward = await prisma.reward.update({ where: { id: Number(id) }, data });
        res.json({ success: true, reward });
    } catch (error) {
        next(error);
    }
};

// DELETE /api/admin/rewards/:id
exports.deleteReward = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.reward.delete({ where: { id: Number(id) } });
        res.json({ success: true, message: 'Reward deleted' });
    } catch (error) {
        next(error);
    }
};
