const prisma = require('../lib/prisma');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const SALT_ROUNDS = 10;

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

    const token = jwt.sign({
        id: user.id,
        username: user.username
    },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return {
        success: true,
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            username: user.username,
            points: user.points
        }
    };

}