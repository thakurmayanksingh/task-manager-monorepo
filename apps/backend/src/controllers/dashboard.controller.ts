import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;

        // FIXED: Added double quotes around "Tasks" and "ProjectMembers" to enforce exact case matching in PostgreSQL
        const stats: any[] = await prisma.$queryRaw`
            SELECT
                COUNT(id) AS total_assigned_tasks,
                COUNT(CASE WHEN status = 'To Do' THEN 1 END) AS pending_tasks,
                COUNT(CASE WHEN status = 'In Progress' THEN 1 END) AS active_tasks,
                COUNT(CASE WHEN status = 'Done' THEN 1 END) AS completed_tasks,
                COUNT(CASE WHEN status != 'Done' AND due_date < CURRENT_TIMESTAMP THEN 1 END) AS overdue_tasks
            FROM "Tasks"
            WHERE assignee_id = ${userId}::uuid
              AND project_id IN (
                SELECT project_id FROM "ProjectMembers" WHERE user_id = ${userId}::uuid
              );
        `;

        const formattedStats = {
            total_assigned: Number(stats[0].total_assigned_tasks || 0),
            pending: Number(stats[0].pending_tasks || 0),
            active: Number(stats[0].active_tasks || 0),
            completed: Number(stats[0].completed_tasks || 0),
            overdue: Number(stats[0].overdue_tasks || 0)
        };

        res.status(200).json({ success: true, data: formattedStats });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
    }
};