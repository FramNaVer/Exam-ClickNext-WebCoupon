// Mock bcrypt before importing authService
jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn(),
}));

// Mock crypto for refresh token generation
jest.mock('crypto', () => ({
    randomBytes: jest.fn().mockReturnValue({ toString: () => 'mock_refresh_token_123' }),
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
    sign: jest.fn().mockReturnValue('mock_jwt_token'),
    verify: jest.fn(),
}));

// Mock prisma
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

// Set JWT_SECRET before importing authService
process.env.JWT_SECRET = 'test_secret_key';


const prisma = require('../lib/prisma');
const authService = require('../services/authService');
const AppError = require('../utils/appError');
const bcrypt = require('bcrypt');

describe('AuthService', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        jest.useRealTimers();
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

        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(true);
        prisma.refreshToken.create.mockResolvedValue({ token: 'mock_refresh_token_123' });

        const result = await authService.login(inputData);


        expect(result.success).toBe(true);
        expect(result.message).toBe('Login successful');
        expect(result.token).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.user).toEqual({
            id: mockUser.id,
            username: mockUser.username,
            points: mockUser.points,
        });

        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: inputData.username } });
        expect(bcrypt.compare).toHaveBeenCalledWith(inputData.password, mockUser.password);
        expect(prisma.refreshToken.create).toHaveBeenCalledWith({
            data: {
                token: expect.any(String),
                userId: mockUser.id,
                expiresAt: expect.any(Date),
            }
        });
    });

    test('login missing username or password throws error', async () => {
        await expect(authService.login({ username: '', password: '' })).rejects.toThrow(
            new AppError('Username and password are required', 400)
        );
    });

    test('login user not found throws error', async () => {
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(authService.login({ username: 'notfound', password: 'password123' })).rejects.toThrow(
            new AppError('Invalid username or password', 401)
        );
    });

    test('login wrong password throws error', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: '$2b$10$hashedpassword',
            points: 100,
        };

        prisma.user.findUnique.mockResolvedValue(mockUser);
        bcrypt.compare.mockResolvedValue(false);

        await expect(authService.login({ username: 'testuser', password: 'wrongpassword' })).rejects.toThrow(
            new AppError('Invalid username or password', 401)
        );
    });


    //Generate new access and refresh tokens tests
    test('refresh successfully refreshes tokens', async () => {
        const mockRefreshToken = {
            token: 'mock_refresh_token_123',
            userId: 1,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour in the future
        };
        const mockUser = {
            id: 1,
            username: 'testuser',
            points: 100,
        };

        prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
        prisma.user.findUnique.mockResolvedValue(mockUser);
        prisma.refreshToken.delete.mockResolvedValue({});
        prisma.refreshToken.create.mockResolvedValue({ token: 'new_mock_refresh_token_456' });

        const result = await authService.refresh('mock_refresh_token_123');

        expect(result.success).toBe(true);
        expect(result.token).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(typeof result.refreshToken).toBe('string');
        
        expect(prisma.refreshToken.findUnique).toHaveBeenCalledWith({ where: { token: 'mock_refresh_token_123' } });
        expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: mockRefreshToken.userId } });
        expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { token: 'mock_refresh_token_123' } });
        expect(prisma.refreshToken.create).toHaveBeenCalledWith({
            data: {
                token: expect.any(String),
                userId: mockUser.id,
                expiresAt: expect.any(Date),
            }
        });
    });

    test('refresh invalid token throws error', async () => {
        prisma.refreshToken.findUnique.mockResolvedValue(null);

        await expect(authService.refresh('invalid_token')).rejects.toThrow(
            new AppError('Invalid or expired refresh token', 401)
        );
    });

    test('refresh expired token throws error', async () => {
        const mockExpiredToken = {
            token: 'expired_token',
            userId: 1,
            expiresAt: new Date(Date.now() - 1000), // in the past
        };

        prisma.refreshToken.findUnique.mockResolvedValue(mockExpiredToken);
        prisma.refreshToken.delete.mockResolvedValue({});

        await expect(authService.refresh('expired_token')).rejects.toThrow(
            new AppError('Invalid or expired refresh token', 401)
        );
    });

    test('refresh user not found throws error', async () => {
        const mockRefreshToken = {
            token: 'valid_token',
            userId: 999,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        };

        prisma.refreshToken.findUnique.mockResolvedValue(mockRefreshToken);
        prisma.user.findUnique.mockResolvedValue(null);

        await expect(authService.refresh('valid_token')).rejects.toThrow(
            new AppError('User not found', 401)
        );
    });

    // Logout tests
    test('logout successfully clears refresh token', async () => {
        prisma.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

        const result = await authService.logout('refresh_token_123');

        expect(result.success).toBe(true);
        expect(result.message).toBe('Logged out successfully');
        expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'refresh_token_123' } });
    });

    test('logout with no token returns success', async () => {
        const result = await authService.logout(null);

        expect(result.success).toBe(true);
        expect(prisma.refreshToken.deleteMany).not.toHaveBeenCalled();
    });
});