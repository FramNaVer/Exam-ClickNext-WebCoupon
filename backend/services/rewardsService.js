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

