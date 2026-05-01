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

exports.getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id: Number(id) },
        select: { id: true, username: true, role: true, provider: true, points: true, created_at: true }
    });
    return user;
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

exports.getLogs = async ({page =1, limit= 20, level, action, startDate, endDate} = {}) => {
    const where = {};

    // filter by level (info / warn / error)
    if (level) {
        where.level = level;
    }

    // filter by action type (USER_LOGIN, REWARD_DELETED ...)
    if (action) {
        where.action = action;
    }

    // filter by date range
    if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) {
            where.timestamp.gte = new Date(startDate);
        }
        if (endDate) {
            where.timestamp.lte = new Date(endDate);
        }
    }

    const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
            where,
            orderBy: { created_at: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.activityLog.count({ where })
    ])

    return {
        logs,
        total,
        page,
        totalPages: Math.ceil(total / limit)
    };
}
