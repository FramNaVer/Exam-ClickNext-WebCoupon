const prisma = require('../lib/prisma');
const AppError = require('../utils/appError');


//Get list of all users
exports.getUsers = async () => {
    const users = await prisma.user.findMany({
        select: { id: true, username: true, role: true, provider: true, points: true, created_at: true },
        orderBy: { created_at: 'desc' },
    });
    return users;
}

//Update user role
exports.updateUserRole = async (userId, role) => {
    // Validate input
    if (!userId || !role){
        throw new AppError('User ID and role are required', 400);
    }
    
    if (!['user', 'admin'].includes(role)) {
        throw new AppError('Invalid role', 400);
    }

    const user = await prisma.user.update({
        where: {id: Number(userId)},
        data: { role },
        select: { id: true, username: true, role: true }
    });

    return user;
}

//Update user points
exports.updateUserPoints = async (userId, points) => {
    if (!userId || points === undefined) {
        throw new AppError('User ID and points are required', 400);
    }

    if (typeof points !== 'number') {
        throw new AppError('Points must be a number', 400);
    }

    const user = await prisma.user.update({
        where: { id: Number(userId) },
        data: { points },
        select: { id: true, username: true, points: true },
    });

    return user;
}