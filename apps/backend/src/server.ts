import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import projectRoutes from './routes/project.routes';
import dashboardRoutes from './routes/dashboard.routes';

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
    origin: process.env.VITE_API_URL || 'http://localhost:5173', 
    credentials: true 
}));
app.use(express.json()); 

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Simple Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Task Manager API is running smoothly.' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is locked and loaded on http://localhost:${PORT}`);
});