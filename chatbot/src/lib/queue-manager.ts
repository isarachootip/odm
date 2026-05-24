// Queue Number Management System
import { prisma } from './db';

/**
 * Generate next queue number for today
 * Queue numbers reset daily (1-999)
 */
export async function generateQueueNumber(): Promise<number> {
    // Get today's date (start of day in local timezone)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find the highest queue number for today
    const lastOrder = await prisma.order.findFirst({
        where: {
            createdAt: {
                gte: today,
                lt: tomorrow
            },
            queueNumber: {
                not: null
            }
        },
        orderBy: {
            queueNumber: 'desc'
        },
        select: {
            queueNumber: true
        }
    });

    // Next queue number (1 if no orders today, otherwise increment)
    const nextQueue = (lastOrder?.queueNumber || 0) + 1;

    // Safety check: max 999 per day
    if (nextQueue > 999) {
        throw new Error('Daily queue limit reached (999)');
    }

    return nextQueue;
}

/**
 * Get current queue status for display
 */
export async function getQueueStatus() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = await prisma.order.groupBy({
        by: ['status'],
        where: {
            createdAt: {
                gte: today,
                lt: tomorrow
            },
            queueNumber: {
                not: null
            }
        },
        _count: {
            status: true
        }
    });

    const totalToday = stats.reduce((sum, s) => sum + s._count.status, 0);
    const pending = stats.find(s => s.status === 'PAID' || s.status === 'PROCESSING')?._count.status || 0;
    const completed = stats.find(s => s.status === 'COMPLETED')?._count.status || 0;

    return {
        totalToday,
        pending,
        completed
    };
}
