import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { signupSchema, loginSchema } from '../schemas/auth.schema';

// Helper to generate both tokens according to the hybrid strategy
const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET as string, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

// Helper to set the secure HttpOnly cookie
const setRefreshCookie = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true, // Prevents JavaScript/XSS access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        // 1. Validate Input via Zod
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.format() });
            return;
        }
        const { email, password, name } = parsed.data;

        // 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(409).json({ success: false, error: 'Email already in use' });
            return;
        }

        // 3. Hash password with bcrypt cost factor 12
        const password_hash = await bcrypt.hash(password, 12);

        // 4. Save to database
        const newUser = await prisma.user.create({
            data: { email, password_hash, name }
        });

        // 5. Generate tokens and set cookie
        const { accessToken, refreshToken } = generateTokens(newUser.id);
        setRefreshCookie(res, refreshToken);

        res.status(201).json({ success: true, data: { id: newUser.id, name: newUser.name, email: newUser.email, accessToken } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const parsed = loginSchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({ success: false, error: parsed.error.format() });
            return;
        }
        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
            return;
        }

        const { accessToken, refreshToken } = generateTokens(user.id);
        setRefreshCookie(res, refreshToken);

        res.status(200).json({ success: true, data: { id: user.id, name: user.name, email: user.email, accessToken } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.status(200).json({ success: true, data: null });
};