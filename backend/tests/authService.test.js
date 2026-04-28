jest.mock('../lib/prisma', () => ({
    user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    },
    refreshToken: {
        findUnique: jest.fn(),
        delete: jest.fn(),
        create: jest.fn(),
        deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
}));


const prisma = require('../lib/prisma');
const authService = require('../services/authService');
const AppError = require('../utils/appError');

describe('AuthService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        // Restore real timers after all tests in this file
        jest.useRealTimers();
        jest.mock('bcrypt');
    });

    // Register tests
    test('register successfully registers a new user', async () => {

        const mockUser = { id: 1, username: 'testuser' };
        const inputData = { username: 'testuser', password: 'password123' };

        prisma.user.findUnique.mockResolvedValue(null);
        prisma.user.create.mockResolvedValue(mockUser);

        const result = await authService.register(inputData);

        expect(result).toEqual({
            success: true,
            message: 'User registered successfully',
            user: mockUser,
        });

        expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prisma.user.create).toHaveBeenCalledTimes(1);
        expect(prisma.user.create).toHaveBeenCalledWith({
            data: {
                username: inputData.username,
                password: expect.any(String),
            }
        })
    });

    test('register missing username or password throws error', async () => {
        jest.clearAllMocks();

        await expect(authService.register({ username: '', password: '' })).rejects.toThrow(
            new AppError('Username and password are required', 400)
        );

        expect(prisma.user.findUnique).not.toHaveBeenCalled();
        expect(prisma.user.create).not.toHaveBeenCalled();

    });

    test('register password too short throws error', async () => {

        await expect(authService.register({ username: 'testuser', password: '123' })).rejects.toThrow(
            new AppError('Password must be at least 6 characters', 400)
        );

        expect(prisma.user.findUnique).not.toHaveBeenCalled();
        expect(prisma.user.create).not.toHaveBeenCalled();

    });

    test('register username already exists throws error', async () => {

        prisma.user.findUnique.mockResolvedValue({ id: 1, username: 'testuser' });

        await expect(authService.register({ username: 'testuser', password: 'password123' })).rejects.toThrow(
            new AppError('Username already exists', 400)
        );

        expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prisma.user.create).not.toHaveBeenCalled();
    });


    // Login tests
    test('login successfully logs in a user', async () => {

        const mockUser = {
            id: 1,
            username: 'testuser',
            password: '$2b$10$hashedpassword',
            points: 100,
        };
        const inputData = { username: 'testuser', password: 'password123' };

    });

});