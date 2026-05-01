const prisma = require('../lib/prisma');

async function logActivity({
    level, action, actorId, actorName,
    targetType, targetId, message,
    metadata, ipAddress
}) {
    try {
        await prisma.activityLog.create({
            data: {
                level,
                action,
                actor_id: actorId,
                actor_name: actorName,
                target_type: targetType,
                target_id: targetId,
                message,
                metadata,
                ip_address: ipAddress
            }
        });
    } catch (error) {
        console.error('Error logging activity:', error);
    }
}

module.exports = logActivity;