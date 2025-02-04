const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// Create a pool instead of a single connection
const pool = mysql.createPool({
    host: process.env.DB_HOST ,
    user: process.env.DB_USER ,
    password: process.env.DB_PASSWORD ,
    database: process.env.DB_NAME ,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true
    } : false
});

// Convert pool to promise-based pool
const promisePool = pool.promise();

// Test the connection
promisePool.query('SELECT 1')
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Error connecting to the database:', err));

module.exports = promisePool;
