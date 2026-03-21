const redeemService = require('../services/RedeemService');

exports.redeemReward = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const rewardId = parseInt(req.params.id, 10);
        if (isNaN(rewardId)) {
            return res.status(400).json({ success: false, message: 'Invalid reward ID' });
        }
        const redemption = await redeemService.redeemReward(userId, rewardId);
        return res.status(201).json({ success: true, message: 'Reward redeemed successfully', data: redemption });
    } catch (error) {
        next(error);
    }
};

exports.getRedemptionHistory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const history = await redeemService.getRedemptionHistory(userId);
        return res.json({ success: true, data: history });
    } catch (error) {
        next(error);
    }
};