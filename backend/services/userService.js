const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');

exports.getUserProfile = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            points: true,
        }
    })

    if (!user) {
        throw new AppError('User not found', 404);
    }

    return user;
}

exports.updateUserProfile = async (userId, { username }) => {
    if (!username) {
        throw new AppError('Username is required', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { username } });

    if (existingUser && existingUser.id !== userId) {
        throw new AppError('Username already exists', 400);
    }

    const updateUser = await prisma.user.update({
        where: { id: userId },
        data: { username },
        select: { id: true, username: true, points: true }
    })

    return { id: updateUser.id, username: updateUser.username };
}
