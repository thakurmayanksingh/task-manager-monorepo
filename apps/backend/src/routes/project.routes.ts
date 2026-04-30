import { Router } from 'express';
import { getUserProjects, createProject } from '../controllers/project.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import taskRoutes from './task.routes';

const router = Router();

// Protect all routes in this file with JWT verification
router.use(requireAuth);

router.get('/', getUserProjects);
router.post('/', createProject);

// Mount the nested task routes
router.use('/:projectId/tasks', taskRoutes);

export default router;