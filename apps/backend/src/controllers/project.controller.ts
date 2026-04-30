import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createProjectSchema } from '../schemas/entity.schema';

// Get all projects for the logged-in user
export const getUserProjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: { user_id: userId } // Only fetch projects where this user is a member
                }
            },
            include: {
                members: { select: { role: true, user: { select: { name: true, email: true } } } }
            }
        });
        
        res.status(200).json({ success: true, data: projects });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch projects' });
    }
};

// Create a new project and make the creator an Admin
export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const parsed = createProjectSchema.safeParse(req.body);
        
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.format() });
            return;
        }

        const { name, description } = parsed.data;

        // Use a database transaction to ensure both records are created together
        const newProject = await prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    name,
                    description: description ?? null,
                    created_by: userId
                }
            });

            await tx.projectMember.create({
                data: {
                    project_id: project.id,
                    user_id: userId,
                    role: 'Admin' // Creator is automatically an Admin
                }
            });

            return project;
        });

        res.status(201).json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create project' });
    }
};