const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const allowedOrigins = [
    'https://yogafront.netlify.app',
    'http://localhost:3000'
];
app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Yoga Class Enrollment API' });
});

// Routes
app.use('/api', enrollmentRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
