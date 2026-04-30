import { Response, NextFunction } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from './auth.middleware';

export const requireRole = (allowedRoles: ('Admin' | 'Member')[]) => {
    return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.id;
            // Support extracting project ID from either /projects/:id or /projects/:projectId routes
            const projectId = (req.params.id || req.params.projectId) as string; 

            if (!userId || !projectId) {
                res.status(400).json({ success: false, error: 'Missing user or project context' });
                return;
            }

            // Query the ProjectMembers junction table to check their explicit role in THIS specific project
            const membership = await prisma.projectMember.findUnique({
                where: {
                    project_id_user_id: {
                        project_id: projectId,
                        user_id: userId
                    }
                }
            });

            if (!membership || !allowedRoles.includes(membership.role)) {
                res.status(403).json({ success: false, error: 'Forbidden: Insufficient project permissions' });
                return;
            }

            // Attach role to request for downstream controllers (e.g., granular task updates)
            req.userRole = membership.role; 
            next();
        } catch (error) {
            res.status(500).json({ success: false, error: 'Internal server error checking permissions' });
        }
    };
};