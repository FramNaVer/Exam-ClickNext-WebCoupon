const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.use(authMiddleware, requireRole('admin'));

// Users
router.get('/users', adminController.getUsers);
router.patch('/users/:id/role', adminController.updateUserRole);
router.patch('/users/:id/points', adminController.updateUserPoints);

// Rewards
router.get('/rewards', adminController.getRewards);
router.post('/rewards', adminController.createReward);
router.patch('/rewards/:id', adminController.updateReward);
router.delete('/rewards/:id', adminController.deleteReward);

module.exports = router;
