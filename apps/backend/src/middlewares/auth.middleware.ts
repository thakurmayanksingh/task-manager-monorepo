import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include our user object
export interface AuthRequest extends Request {
    user?: { id: string };
    userRole?: 'Admin' | 'Member';
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Extract token from the Authorization header (Bearer <token>)
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        res.status(401).json({ success: false, error: 'Unauthorized: Invalid or expired token' });
    }
};