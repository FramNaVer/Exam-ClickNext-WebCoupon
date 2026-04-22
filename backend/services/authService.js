const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const AppError = require('../utils/appError');
const SALT_ROUNDS = 10;

function generateAccessToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
}

async function generateRefreshToken(userId) {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await prisma.refreshToken.create({ data: { token, userId, expiresAt } });
    return token;
}

exports.register = async ({ username, password }) => {

    if (!username || !password) {
        throw new AppError('Username and password are required', 400);
    }

    if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });

    if (existingUser) {
        throw new AppError('Username already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await prisma.user.create({
        data: { username, password: hashedPassword }
    })

    return { success: true, message: 'User registered successfully', user: { id: newUser.id, username: newUser.username } };
}

exports.login = async ({ username, password }) => {

    if (!username || !password) {
        throw new AppError('Username and password are required', 400);
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user) {
        throw new AppError('Invalid username or password', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new AppError('Invalid username or password', 401);
    }

    const token = generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user.id);

    return {
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: {
            id: user.id,
            username: user.username,
            points: user.points
        }
    };

}

exports.refresh = async (refreshToken) => {
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!stored || stored.expiresAt < new Date()) {
        if (stored) await prisma.refreshToken.delete({ where: { token: refreshToken } });
        throw new AppError('Invalid or expired refresh token', 401);
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) throw new AppError('User not found', 401);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const newRefreshToken = await generateRefreshToken(user.id);
    const accessToken = generateAccessToken(user);

    return { success: true, token: accessToken, refreshToken: newRefreshToken };
}

exports.logout = async (refreshToken) => {
    if (refreshToken) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return { success: true, message: 'Logged out successfully' };
}