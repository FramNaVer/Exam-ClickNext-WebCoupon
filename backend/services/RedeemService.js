const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');


exports.redeemReward = async (userId, rewardId) => {

    const reward = await prisma.reward.findUnique({
        where: { id: rewardId },
        select: {
            id: true,
            title: true,
            points_required: true,
            redeem_start_date: true,
            redeem_end_date: true,
            stock: true,
        }
    });

    if (!reward) {
        throw new AppError('Reward not found', 404);
    }

    const currentDate = new Date();
    if (currentDate < reward.redeem_start_date || currentDate > reward.redeem_end_date) {
        throw new AppError('Reward is not redeemable at this time', 400);
    }

    if (reward.stock <= 0) {
        throw new AppError('Reward is out of stock', 400);
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
    });

    if (!user) {
        throw new AppError('User not found', 404);
    }

    if (user.points < reward.points_required) {
        throw new AppError('Insufficient points to redeem this reward', 400);
    }

    const existingRedemption = await prisma.redemption.findUnique({
        where: { users_id_reward_id: { users_id: userId, reward_id: rewardId } }
    });

    if (existingRedemption) {
        throw new AppError('You have already redeemed this reward', 400);
    }

    const [, , redemption] = await prisma.$transaction([
        prisma.user.update({
            where: { id: userId },
            data: { points: { decrement: reward.points_required } }
        }),
        prisma.reward.update({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } }
        }),
        prisma.redemption.create({
            data: {
                users_id: userId,
                reward_id: rewardId,
                redeemed_points: reward.points_required,
            }
        })
    ]);

    return redemption;
};


exports.getRedemptionHistory = async (userId) => {
    return prisma.redemption.findMany({
        where: { users_id: userId },
        include: {
            reward: {
                select: {
                    id: true,
                    title: true,
                    image_url: true,
                }
            }
        },
        orderBy: { redeemed_at: 'desc' }
    });
};