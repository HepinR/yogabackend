const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all batches
router.get('/batches', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM batches2'); 
        res.json(rows);
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
    const connection = await db.getConnection();
    
    try {
        const { name, age, email, phone, batchId } = req.body;
        
        // Start transaction
        await connection.beginTransaction();

        // Insert user
        const [userResult] = await connection.execute(
            'INSERT INTO users3 (name, age, email, phone) VALUES (?, ?, ?, ?)',
            [name, age, email, phone]
        );

        // Insert enrollment
        const [enrollmentResult] = await connection.execute(
            'INSERT INTO enrollments3 (user_id, batch_id) VALUES (?, ?)',
            [userResult.insertId, batchId]
        );

        // Update batch enrollment count
        await connection.execute(
            'UPDATE batches2 SET current_enrollments = current_enrollments + 1 WHERE id = ?',
            [batchId]
        );

        // Commit the transaction
        await connection.commit();
        
        connection.release();

        res.json({
            success: true,
            enrollmentId: enrollmentResult.insertId,
            message: 'Enrollment successful'
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
            connection.release();
        }
        console.error('Enrollment error:', error);
        res.status(500).json({ 
            error: 'Enrollment failed', 
            details: error.message,
            code: error.code 
        });
    }
});

// Get all enrollments
router.get('/enrollments', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                e.id as enrollment_id,
                u.name,
                u.email,
                u.phone,
                b.time_slot,
                e.enrollment_date
            FROM enrollments e
            JOIN users u ON e.user_id = u.id
            JOIN batches b ON e.batch_id = b.id
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching enrollments:', error);
        res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
});

module.exports = router;