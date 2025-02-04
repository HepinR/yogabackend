const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all batches
router.get('/batches', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM batches2');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching batches:', error);
        res.status(500).json({ error: 'Failed to fetch batch times' });
    }
});

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Enrollment routes working' });
});

// Create enrollment
router.post('/enroll', async (req, res) => {
    const client = await pool.connect(); 
    
    try {
        const { name, age, email, phone, batchId } = req.body;
        
        await client.query('BEGIN'); 

        // Insert user
        const userResult = await client.query(
            'INSERT INTO users3 (name, age, email, phone) VALUES ($1, $2, $3, $4) RETURNING id',
            [name, age, email, phone]
        );

        // Insert enrollment
        const enrollmentResult = await client.query(
            'INSERT INTO enrollments3 (user_id, batch_id) VALUES ($1, $2) RETURNING id',
            [userResult.rows[0].id, batchId]
        );

        // Update batch
        await client.query(
            'UPDATE batches2 SET current_enrollments = current_enrollments + 1 WHERE id = $1',
            [batchId]
        );

        await client.query('COMMIT');
        
        res.json({
            success: true,
            enrollmentId: enrollmentResult.rows[0].id,
            message: 'Enrollment successful'
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Enrollment error:', error);
        res.status(500).json({ 
            error: 'Enrollment failed',
            details: error.message,
            code: error.code 
        });
    } finally {
        client.release();
    }
});

// Get all enrollments
router.get('/enrollments', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                e.id as enrollment_id,
                u.name,
                u.email,
                u.phone,
                b.time_slot,
                e.enrollment_date
            FROM enrollments3 e
            JOIN users3 u ON e.user_id = u.id
            JOIN batches2 b ON e.batch_id = b.id
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});

module.exports = router;
