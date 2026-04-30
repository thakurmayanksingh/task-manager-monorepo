import { z } from 'zod';

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required"),
    description: z.string().optional()
}).strict();

export const updateProjectSchema = z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional()
}).strict();

export const createTaskSchema = z.object({
    title: z.string().min(1, "Task title is required"),
    description: z.string().optional(),
    due_date: z.string().datetime("Must be a valid ISO 8601 date string"),
    assignee_id: z.string().uuid("Invalid user ID").optional().nullable()
}).strict();

export const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    // This exact line fixes your crash! It perfectly matches the frontend dropdown values.
    status: z.enum(['To Do', 'In Progress', 'Done']).optional(), 
    due_date: z.string().datetime().optional(),
    assignee_id: z.string().uuid().optional().nullable(),
    description: z.string().optional()
}).strict();