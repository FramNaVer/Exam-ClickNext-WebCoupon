const cron = require('node-cron');
const { cleanOldLogs } = require('../services/logService');

const RETENTION_DAYS = Number(process.env.LOG_RETENTION_DAYS) || 90

function startLogCleanupJob() {
    // Schedule the job to run daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('[LogCleanup] Starting log cleanup job...');
        try {
            await cleanOldLogs(RETENTION_DAYS);
            console.log('[LogCleanup] Log cleanup job completed.');
        } catch (error) {
            console.error('[LogCleanup] Error during log cleanup:', error);
        }
    });
    console.log(`[LogCleanup] Job scheduled — retaining ${RETENTION_DAYS} days of logs`)
}

module.exports = { startLogCleanupJob };