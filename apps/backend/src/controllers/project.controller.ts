import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createProjectSchema, updateProjectSchema } from '../schemas/entity.schema';

// Get all projects for the logged-in user
export const getUserProjects = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const projects = await prisma.project.findMany({
            where: {
                members: {
                    some: { user_id: userId } 
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

// Get a single project's details AND the user's role
export const getProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: { include: { user: { select: { id: true, name: true, email: true } } } } }
        });
        // We return the project AND the user's role (calculated by the middleware)
        res.status(200).json({ success: true, data: { project, role: req.userRole } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch project details' });
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
                    role: 'Admin' 
                }
            });

            return project;
        });

        res.status(201).json({ success: true, data: newProject });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to create project' });
    }
};

// Update project metadata (Admin only)
export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        const parsed = updateProjectSchema.safeParse(req.body);
        
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.format() }); 
            return;
        }
        
        // Use 'any' to bypass overly strict TS compilation. Zod already guaranteed runtime safety!
        const updatePayload: any = { ...parsed.data };

        const updated = await prisma.project.update({ 
            where: { id: projectId }, 
            data: updatePayload 
        });
        
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update project' });
    }
};

// Invite a user to the project
export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = (req.params.projectId || req.params.id) as string;
        const { email, role } = req.body;

        if (!projectId) {
            res.status(400).json({ success: false, error: 'Project ID is required' });
            return;
        }

        if (!email || !role) {
            res.status(400).json({ success: false, error: 'Email and role are required' });
            return;
        }

        const userToInvite = await prisma.user.findUnique({ where: { email } });
        if (!userToInvite) {
            res.status(404).json({ success: false, error: 'User with this email not found' });
            return;
        }

        const existingMember = await prisma.projectMember.findUnique({
            where: {
                project_id_user_id: { project_id: projectId, user_id: userToInvite.id }
            }
        });

        if (existingMember) {
            res.status(400).json({ success: false, error: 'User is already a member of this project' });
            return;
        }

        const newMember = await prisma.projectMember.create({
            data: {
                project_id: projectId, 
                user_id: userToInvite.id,
                role: role as 'Admin' | 'Member'
            },
            include: {
                user: { select: { name: true, email: true } }
            }
        });

        res.status(201).json({ success: true, data: newMember });
    } catch (error) {
        console.error("Invite Member Error:", error);
        res.status(500).json({ success: false, error: 'Failed to invite member' });
    }
};

// Delete a project entirely (Admin only)
export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const projectId = req.params.projectId as string;
        // Prisma's CASCADE delete will automatically wipe all tasks and members associated with this project!
        await prisma.project.delete({ where: { id: projectId } });
        res.status(204).send(); // 204 means "No Content" (Success!)
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete project' });
    }
};

// Remove a member from the project (Admin only)
export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Explicitly casting these to "string" clears the TypeScript errors!
        const projectId = req.params.projectId as string;
        const userId = req.params.userId as string;
        
        await prisma.projectMember.delete({
            where: {
                project_id_user_id: { project_id: projectId, user_id: userId }
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to remove member' });
    }
};