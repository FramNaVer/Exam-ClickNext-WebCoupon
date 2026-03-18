const rewardService = require('../services/rewardsService');

exports.getAllRewards = async (req, res, next) => {
    try {
        const rewards = await rewardService.getAllRewards();
        return res.json({ success: true, rewards });
    } catch (error) {
        next(error);
    }
}