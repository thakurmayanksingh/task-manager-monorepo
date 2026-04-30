import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, logout } from '../controllers/auth.controller';

const router = Router();

// Strict rate limiter: 10 requests per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window`
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply the limiter only to login and signup
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);

export default router;