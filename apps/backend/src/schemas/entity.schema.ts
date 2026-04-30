import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional()
}).strict(); // Prevents malicious injection of role updates via standard payloads

export const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    due_date: z.string().datetime("Must be a valid ISO 8601 date string"),
    assignee_id: z.string().uuid("Invalid user ID").optional().nullable()
}).strict();

export const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(), // Matches our Prisma Enums
    due_date: z.string().datetime().optional(),
    assignee_id: z.string().uuid().optional().nullable()
}).strict();