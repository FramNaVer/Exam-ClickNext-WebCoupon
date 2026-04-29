

//Mock prisma
jest.mock('../lib/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
    reward: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
    },
}));



const prisma = require('../lib/prisma');
const rewardsService = require('../services/rewardsService');
const AppError = require('../utils/appError');

describe('RewardsService', () => {
    jest.useFakeTimers();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    test('Get all rewards successfully', async () => {

        const mockRewards = [
            { id: 1, title: 'Reward 1', points_required: 100 },
            { id: 2, title: 'Reward 2', points_required: 200 },
        ];
        prisma.reward.findMany.mockResolvedValue(mockRewards);

        const result = await rewardsService.getAllRewards();

        expect(result).toEqual(mockRewards);
        expect(prisma.reward.findMany).toHaveBeenCalledTimes(1);
        expect(prisma.reward.findMany).toHaveBeenCalledWith({
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
    });


    test('Get reward details by ID successfully', async () => {
        jest.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));
        const mockReward = {
            id: 1,
            title: 'Reward 1',
            description: 'Description of Reward 1',
            points_required: 100,
            image_url: 'https://example.com/reward1.jpg',
            expiry_date: new Date('2025-12-31'),
            redeem_start_date: new Date('2025-01-01'),
            redeem_end_date: new Date('2025-12-31'),
            terms_condition: 'Terms and conditions for Reward 1',
            stock: 10,
        };
        prisma.reward.findUnique.mockResolvedValue(mockReward);
        const result = await rewardsService.getRewardsById(1);

        expect(result).toEqual(mockReward);
        expect(prisma.reward.findUnique).toHaveBeenCalledTimes(1);
        expect(prisma.reward.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
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
        });
    });

    test('Get reward details by ID not found throws error', async () => {
        prisma.reward.findUnique.mockResolvedValue(null);

        await expect(rewardsService.getRewardsById(999)).rejects.toThrow(
            new AppError('Reward not found', 404)
        );
    });

    test('Create reward successfully', async () => {

        jest.setSystemTime(new Date('2025-01-15T10:00:00.000Z'));

        const rewardData = {
            title: 'New Reward',
            description: 'Description of new reward',
            points_required: '150',
            image_url: 'https://example.com/newreward.jpg',
            expiry_date: new Date('2025-12-31'),
            redeem_start_date: new Date('2025-01-01'),
            redeem_end_date: new Date('2025-12-31'),
            terms_condition: 'Terms and conditions for new reward',
            stock: '20',
        }

        const createdReward = { id: 1, ...rewardData, points_required: 150, stock: 20 };
        prisma.reward.create.mockResolvedValue(createdReward);

        const result = await rewardsService.createReward(rewardData);
        expect(result).toEqual(createdReward);
        expect(prisma.reward.create).toHaveBeenCalledTimes(1);
        expect(prisma.reward.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: rewardData.title,
                description: rewardData.description,
                points_required: 150,
                image_url: rewardData.image_url,
                expiry_date: expect.any(Date),
                redeem_start_date: expect.any(Date),
                redeem_end_date: expect.any(Date),
                terms_condition: rewardData.terms_condition,
                stock: 20,
            })
        });

    });

    test('Create reward missing required fields throws error', async () => {
        await expect(rewardsService.createReward({ description: 'No title or points' })).rejects.toThrow(
            new AppError('Title and points_required are mandatory fields.', 400)
        );
    });

    test('Create reward with invalid points or stock throws error', async () => {
        await expect(rewardsService.createReward({
            title: 'Invalid Reward',
            points_required: '-50',
            stock: 10,
        })).rejects.toThrow(
            new AppError('Points required must be a valid non-negative number.', 400)
        );
    });

});