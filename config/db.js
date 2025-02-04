const mysql = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Create a pool instead of a single connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});


// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Database connected successfully');
    }
});

module.exports = pool;
