import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './src/config/db.js';
import logger from './src/middleware/logger.js';
import authRoutes from './src/routes/auth.js';
import sessionRoutes from './src/routes/session.js';
import contentRoutes from './src/routes/content.js';
import courseRoutes from './src/routes/course.js';
import enrollmentRoutes from './src/routes/enrollment.js';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.resolve(__dirname, "../client/dist")));
// Middleware
app.use(cors({
    origin: 'http://localhost:5173', // Your Vite frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Apply logger to all API routes
app.use('/api', logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/enrollment', enrollmentRoutes);

// --- PRODUCTION CONFIGURATION ---
if (process.env.NODE_ENV === 'production') {
    // Serve static files from the React app build folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Catch-all route to serve index.html (SPA Fallback)
    // Using app.use with no path to avoid path-to-regexp errors in Express 5
    app.use((req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running in development mode...');
    });
}

// Database connection
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
