import { Router } from 'express';
import { getTasks, createTask, updateTask, deleteTask } from '../controllers/task.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';

// mergeParams: true allows this router to read the :projectId from the parent project router
const router = Router({ mergeParams: true });

router.use(requireAuth);

// Both Admins and Members can view tasks
router.get('/', requireRole(['Admin', 'Member']), getTasks);

// Only Admins can create or delete tasks
router.post('/', requireRole(['Admin']), createTask);
router.delete('/:taskId', requireRole(['Admin']), deleteTask);

// Both can update, but the controller handles the granular restrictions
router.put('/:taskId', requireRole(['Admin', 'Member']), updateTask);

export default router;