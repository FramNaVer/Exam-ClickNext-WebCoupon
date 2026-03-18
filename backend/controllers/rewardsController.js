const rewardService = require('../services/rewardsService');

exports.getAllRewards = async (req, res, next) => {
    try {
        const rewards = await rewardService.getAllRewards();
        return res.json({ success: true, rewards });
    } catch (error) {
        next(error);
    }
}

exports.getRewardById = async (req, res, next) => {
    try {
        const rewardId = parseInt(req.params.id,10);
        if (isNaN(rewardId)) {
            return res.status(400).json({ success: false, message: 'Invalid reward ID' });
        }
        const reward = await rewardService.getRewardsById(rewardId);
        return res.json({ success: true, reward });
    }catch (error) {
        next(error);
    }
}