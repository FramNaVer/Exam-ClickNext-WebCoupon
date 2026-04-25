const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');


//Get list of all rewards
exports.getAllRewards = async () => {
    const rewards = await prisma.reward.findMany({
        select: {
            id: true,
            title: true,
            description: true,
            points_required: true,
            image_url: true,
            expiry_date: true,
            redeem_start_date: true,
            redeem_end_date: true,
            stock: true,
        },
        orderBy: { id: 'asc' }
    });

    return rewards;
}

//Get reward details by ID
exports.getRewardsById = async (rewardId) => {
    const reward = await prisma.reward.findUnique({
        where: {id: rewardId},
        select: {
            id: true,
            title: true,
            description: true,
            points_required: true,
            image_url: true,
            expiry_date: true,
            redeem_start_date: true,
            redeem_end_date: true,
            terms_condition: true,
            stock: true,
        }
    })

    if (!reward) {
        throw new AppError('Reward not found', 404);
    }

    return reward;
}

exports.getAllRewardsForAdmin = async () => {
    return prisma.reward.findMany({ orderBy: { created_at: 'desc' } });
};

exports.createReward = async (rewardData) => {
    const { expiry_date, redeem_start_date, redeem_end_date, ...rest } = rewardData;

    const data = {
        ...rest,
        ...(expiry_date && { expiry_date: new Date(expiry_date) }),
        ...(redeem_start_date && { redeem_start_date: new Date(redeem_start_date) }),
        ...(redeem_end_date && { redeem_end_date: new Date(redeem_end_date) }),
    };

    return prisma.reward.create({ data });
};

exports.updateReward = async (rewardId, rewardData) => {
    const { expiry_date, redeem_start_date, redeem_end_date, ...rest } = rewardData;

    const data = {
        ...rest,
        ...(expiry_date && { expiry_date: new Date(expiry_date) }),
        ...(redeem_start_date && { redeem_start_date: new Date(redeem_start_date) }),
        ...(redeem_end_date && { redeem_end_date: new Date(redeem_end_date) }),
    };

    return prisma.reward.update({
        where: { id: Number(rewardId) },
        data,
    });
};

exports.deleteReward = async (rewardId) => {
    return prisma.reward.delete({ where: { id: Number(rewardId) } });
};
