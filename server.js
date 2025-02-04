const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

dotenv.config();

const app = express();
// Let Render assign the port or use 5000 for local development
const PORT = process.env.PORT || 5001;

const allowedOrigins = [
    'https://yogafront.netlify.app',
    'http://localhost:3000',
    'http://localhost:5001'
];

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Yoga Class Enrollment API' });
});

// Database test route
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        const batches = await pool.query('SELECT * FROM batches2');
        res.json({
            status: 'success',
            connection: 'Database connected',
            timestamp: result.rows[0].now,
            batches: batches.rows
        });
    } catch (error) {
        console.error('Database test error:', error);
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
});

app.use('/api', enrollmentRoutes);

// Health check
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.status(200).json({ 
            status: 'OK',
            database: 'Connected'
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'Error',
            database: 'Disconnected',
            error: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Something broke!',
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server with database connection check
pool.connect((err, client, done) => {
    if (err) {
        console.error('Database connection error:', err.stack);
        process.exit(1);
    } else {
        console.log('Database connected successfully');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    }
    if (done) done();
});
