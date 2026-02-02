const express = require('express');
const pool = require('../db');

const router = express.Router();

// Get all preparation items
router.get('/', async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM preparation';
        const params = [];

        if (type) {
            params.push(type);
            query += ' WHERE type = $1';
        }

        query += ' ORDER BY COALESCE(target_date, \'9999-12-31\') ASC, created_at ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching preparation items:', err);
        res.status(500).json({ error: 'Failed to fetch preparation items' });
    }
});

// Get preparation summary/stats
router.get('/stats', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE completed = true) as completed,
        MIN(target_date) FILTER (WHERE completed = false AND target_date >= NOW()) as next_target
      FROM preparation
      GROUP BY type
    `);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching preparation stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Add a preparation item
router.post('/', async (req, res) => {
    try {
        const { type, title, target_date, notes } = req.body;

        if (!type || !title) {
            return res.status(400).json({ error: 'Type and title are required' });
        }

        const result = await pool.query(
            `INSERT INTO preparation (type, title, target_date, notes, completed)
       VALUES ($1, $2, $3, $4, false) RETURNING *`,
            [type, title, target_date || null, notes || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding preparation item:', err);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Update a preparation item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, target_date, notes, completed } = req.body;

        const updates = [];
        const values = [];
        let paramIndex = 1;

        if (title !== undefined) {
            values.push(title);
            updates.push(`title = $${paramIndex++}`);
        }
        if (target_date !== undefined) {
            values.push(target_date);
            updates.push(`target_date = $${paramIndex++}`);
        }
        if (notes !== undefined) {
            values.push(notes);
            updates.push(`notes = $${paramIndex++}`);
        }
        if (completed !== undefined) {
            values.push(completed);
            updates.push(`completed = $${paramIndex++}`);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE preparation SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating preparation item:', err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Toggle completion status
router.patch('/:id/toggle', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'UPDATE preparation SET completed = NOT completed WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error toggling item:', err);
        res.status(500).json({ error: 'Failed to toggle item' });
    }
});

// Delete a preparation item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM preparation WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting preparation item:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router;
