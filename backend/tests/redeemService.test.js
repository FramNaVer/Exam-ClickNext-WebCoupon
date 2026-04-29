// Mock the prisma client before all imports
jest.mock('../lib/prisma', () => ({
    reward: {
        findUnique: jest.fn(),
        update: jest.fn(args => args), // Return arguments to inspect in transaction
    },
    user: {
        findUnique: jest.fn(),
        update: jest.fn(args => args),
    },
    redemption: {
        findUnique: jest.fn(),
        create: jest.fn(args => args),
    },
    $transaction: jest.fn(),
}));

const prisma = require('../lib/prisma');
const RedeemService = require('../services/RedeemService');
const AppError = require('../utils/appError');

describe('RedeemService: redeemReward', () => {
    // Enable fake timers to control the current date in tests
    jest.useFakeTimers();

    // Clear all mocks before each test to ensure test isolation
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore real timers after all tests in this file
        jest.useRealTimers();
    });

    test('should successfully redeem a reward and update user points and reward stock', async () => {
        // Set a valid time for the test
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const userId = 1;
        const rewardId = 1;

        const mockReward = {
            id: rewardId,
            points_required: 50,
            stock: 10,
            redeem_start_date: new Date('2025-01-01'),
            redeem_end_date: new Date('2025-12-31'),
        };

        const mockUser = { points: 100 };

        const mockCreatedRedemption = {
            id: 123,
            users_id: userId,
            reward_id: rewardId,
            redeemed_points: mockReward.points_required,
        };

        // Setup mock implementations for a successful scenario
        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.redemption.findUnique.mockResolvedValue(null); // User has not redeemed this before
        prisma.$transaction.mockResolvedValue([
            {}, // Mock result for user update
            {}, // Mock result for reward update
            mockCreatedRedemption, // Mock result for redemption creation
        ]);

        const result = await RedeemService.redeemReward(userId, rewardId);

        // Assert that the function returns the created redemption record
        expect(result).toEqual(mockCreatedRedemption);

        // Assert that the transaction was called with the correct operations
        expect(prisma.$transaction).toHaveBeenCalledTimes(1);
        const transactionCalls = prisma.$transaction.mock.calls[0][0];
        expect(transactionCalls).toHaveLength(3);

        // Assert User Point Deduction
        expect(transactionCalls[0]).toMatchObject({
            where: { id: userId },
            data: { points: { decrement: mockReward.points_required } },
        });

        // Assert Reward Stock Decrement
        expect(transactionCalls[1]).toMatchObject({
            where: { id: rewardId },
            data: { stock: { decrement: 1 } },
        });

        // Assert Redemption Record Creation
        expect(transactionCalls[2]).toMatchObject({
            data: {
                users_id: userId,
                reward_id: rewardId,
                redeemed_points: mockReward.points_required,
            },
        });
    });

    test('should throw an error if reward is not found', async () => {
        prisma.reward.findUnique.mockResolvedValue(null);

        await expect(RedeemService.redeemReward(1, 9999)).rejects.toThrow(
            new AppError('Reward not found', 404)
        );
    });

    test('should throw an error if reward is out of stock', async () => {
        // Set a valid time for the test
        jest.setSystemTime(new Date('2024-01-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 0, // Out of stock
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: new Date('2029-12-31'),
        };
        prisma.reward.findUnique.mockResolvedValue(mockReward);

        await expect(RedeemService.redeemReward(1, 1)).rejects.toThrow(
            new AppError('Reward is out of stock', 400)
        );
    });

    test('should throw an error if user has insufficient points', async () => {
        // Set a valid time for the test
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 100,
            stock: 10,
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: new Date('2029-12-31'),
        };
        const mockUser = { points: 50 }; // Insufficient points

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);

        await expect(RedeemService.redeemReward(1, 1)).rejects.toThrow(
            new AppError('Insufficient points to redeem this reward', 400)
        );
    });

    test('should throw an error if user has already redeemed the reward', async () => {
        // Set a valid time for the test
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: new Date('2029-12-31'),
        };
        const mockUser = { points: 100 };
        const existingRedemption = { id: 1, users_id: 1, reward_id: 1 };

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.redemption.findUnique.mockResolvedValue(existingRedemption); // Already redeemed

        await expect(RedeemService.redeemReward(1, 1)).rejects.toThrow(
            new AppError('You have already redeemed this reward', 400)
        );
    });

    test('should throw an error if reward is not redeemable at this time', async () => {
        // Set time to be after the redeem period
        jest.setSystemTime(new Date('2024-02-01T00:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: new Date('2024-01-31'), // Past end date
        };
        prisma.reward.findUnique.mockResolvedValue(mockReward);

        await expect(RedeemService.redeemReward(1, 1)).rejects.toThrow(
            new AppError('Reward is not redeemable at this time', 400)
        );
    });

    //edge case: should throw an error if user is not found
    test('should throw an error if user is not found', async () => {
        // Set a valid time for the test
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: new Date('2029-12-31'),
        }
        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(null); // User not found

        await expect(RedeemService.redeemReward(9999, 1)).rejects.toThrow(
            new AppError('User not found', 404)
        );
    });

    //should throw an error if current date is before redeem start date
    test('should throw an error if current date is before redeem start date', async () => {
        // Set time to be before the redeem period
        jest.setSystemTime(new Date('2027-12-31T23:59:59.999Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: new Date('2028-01-01'),
            redeem_end_date: new Date('2029-12-31'),// Future start date
        };
        prisma.reward.findUnique.mockResolvedValue(mockReward);

        await expect(RedeemService.redeemReward(1, 1)).rejects.toThrow(
            new AppError('Reward is not redeemable at this time', 400)
        );
    });

    //transaction failure: should throw an error if transaction fails
    test('should throw an error if transaction fails', async () => {
        // Set a valid time for the test
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const userId = 1;
        const rewardId = 1;

        const mockReward = {
            id: rewardId,
            points_required: 20,
            stock: 10,
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: new Date('2029-12-31'),
        };
        const mockUser = { points: 100 };

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);

        prisma.redemption.findUnique.mockResolvedValue(null);
        prisma.$transaction.mockRejectedValue(new Error('Transaction failed')); // Simulate transaction failure

        // ตอนนี้เราสามารถ assert ได้ว่า service จะโยน error ที่มาจาก transaction ออกมาอย่างถูกต้อง
        await expect(RedeemService.redeemReward(userId, rewardId)).rejects.toThrow(
            new Error('Transaction failed')
        );
    });

    // Edge case: null redeem_start_date should allow redemption (treat as no start limit)
    test('should allow redemption when redeem_start_date is null', async () => {
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: null, // No start date limit
            redeem_end_date: new Date('2029-12-31'),
        };
        const mockUser = { points: 100 };

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.redemption.findUnique.mockResolvedValue(null);
        prisma.$transaction.mockResolvedValue([{}, {}, { id: 1 }]);

        const result = await RedeemService.redeemReward(1, 1);
        expect(result).toBeDefined();
    });

    // Edge case: null redeem_end_date should allow redemption (treat as no end limit)
    test('should allow redemption when redeem_end_date is null', async () => {
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: new Date('2024-01-01'),
            redeem_end_date: null, // No end date limit (perpetual)
        };
        const mockUser = { points: 100 };

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.redemption.findUnique.mockResolvedValue(null);
        prisma.$transaction.mockResolvedValue([{}, {}, { id: 1 }]);

        const result = await RedeemService.redeemReward(1, 1);
        expect(result).toBeDefined();
    });

    // Edge case: both null should allow redemption
    test('should allow redemption when both dates are null', async () => {
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 20,
            stock: 10,
            redeem_start_date: null,
            redeem_end_date: null,
        };
        const mockUser = { points: 100 };

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.redemption.findUnique.mockResolvedValue(null);
        prisma.$transaction.mockResolvedValue([{}, {}, { id: 1 }]);

        const result = await RedeemService.redeemReward(1, 1);
        expect(result).toBeDefined();
    });

    // Verify that service uses correct select fields
    test('should query reward with required fields only', async () => {
        jest.setSystemTime(new Date('2025-06-15T10:00:00.000Z'));

        const mockReward = {
            id: 1,
            points_required: 50,
            stock: 10,
            redeem_start_date: new Date('2025-01-01'),
            redeem_end_date: new Date('2025-12-31'),
        };
        const mockUser = { points: 100 };

        prisma.reward.findUnique.mockResolvedValue(mockReward);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.redemption.findUnique.mockResolvedValue(null);
        prisma.$transaction.mockResolvedValue([{}, {}, { id: 1 }]);

        await RedeemService.redeemReward(1, 1);

        // Verify that findUnique was called with select containing required fields
        expect(prisma.reward.findUnique).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { id: 1 },
                select: expect.objectContaining({
                    id: true,
                    points_required: true,
                    redeem_start_date: true,
                    redeem_end_date: true,
                    stock: true,
                })
            })
        );
    });
});
