import { Router } from 'express';
import { 
    getUserProjects, createProject, inviteMember, 
    getProject, updateProject, deleteProject, removeMember 
} from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import taskRoutes from './task.routes';

const router = Router();
router.use(requireAuth);

router.get('/', getUserProjects);
router.post('/', createProject);

// Detailed project routes
router.get('/:projectId', requireRole(['Admin', 'Member']), getProject);
router.put('/:projectId', requireRole(['Admin']), updateProject); 
router.post('/:projectId/members', requireRole(['Admin']), inviteMember); 

// The New Destructive Routes!
router.delete('/:projectId', requireRole(['Admin']), deleteProject); 
router.delete('/:projectId/members/:userId', requireRole(['Admin']), removeMember); 

// Nested tasks
router.use('/:projectId/tasks', taskRoutes);

export default router;