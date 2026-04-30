import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createTaskSchema, updateTaskSchema } from '../schemas/entity.schema';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const tasks = await prisma.task.findMany({
            where: { project_id: projectId },
            include: { assignee: { select: { name: true, email: true } } },
            orderBy: { created_at: 'desc' }
        });
        res.status(200).json({ success: true, data: tasks });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
    }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const parsed = createTaskSchema.safeParse(req.body);
        
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.format() });
            return;
        }

        const task = await prisma.task.create({
            data: {
                title: parsed.data.title,
                due_date: parsed.data.due_date,
                description: parsed.data.description ?? null,
                assignee_id: parsed.data.assignee_id ?? null,
                project_id: projectId
            }
        });

        res.status(201).json({ success: true, data: task });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create task' });
    }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taskId = req.params.taskId as string;
        const role = req.userRole; 
        const userId = req.user!.id;

        const parsed = updateTaskSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.format() });
            return;
        }

        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) {
            res.status(404).json({ success: false, error: 'Task not found' });
            return;
        }

        let updatePayload: any = { ...parsed.data };

        // FIXED: Map the frontend string to the exact Prisma Enum keys expected by schema.prisma
        if (updatePayload.status) {
            const statusMap: Record<string, string> = {
                'To Do': 'TODO',
                'In Progress': 'IN_PROGRESS',
                'Done': 'DONE'
            };
            updatePayload.status = statusMap[updatePayload.status];
        }

        // Granular RBAC enforcement based on blueprint
        if (role === 'Member') {
            if (task.assignee_id !== userId) {
                res.status(403).json({ success: false, error: 'Forbidden: Members can only update their assigned tasks' });
                return;
            }
            // Strip any fields other than status from the request payload
            updatePayload = { status: updatePayload.status };
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: updatePayload
        });

        res.status(200).json({ success: true, data: updatedTask });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Failed to update task' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const taskId = req.params.taskId as string;
        await prisma.task.delete({ where: { id: taskId } });
        res.status(204).send(); 
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete task' });
    }
};