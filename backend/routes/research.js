const express = require('express');
const pool = require('../db');

const router = express.Router();

// Get all research items
router.get('/', async (req, res) => {
    try {
        const { country, status } = req.query;
        let query = 'SELECT * FROM research';
        const params = [];
        const conditions = [];

        if (country) {
            params.push(country);
            conditions.push(`country = $${params.length}`);
        }
        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ' ORDER BY status = \'Shortlisted\' DESC, ranking ASC NULLS LAST, created_at DESC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching research items:', err);
        res.status(500).json({ error: 'Failed to fetch research items' });
    }
});

// Get research stats
router.get('/stats', async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Shortlisted') as shortlisted,
        COUNT(*) FILTER (WHERE status = 'Applied') as applied,
        COUNT(*) FILTER (WHERE country = 'Germany') as germany,
        COUNT(*) FILTER (WHERE country = 'Switzerland') as switzerland
      FROM research
    `);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error fetching research stats:', err);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Add a research item
router.post('/', async (req, res) => {
    try {
        const { university_name, program_name, country, website, ranking, tuition_fees, requirements, notes } = req.body;

        if (!university_name || !program_name || !country) {
            return res.status(400).json({ error: 'University name, program name, and country are required' });
        }

        const result = await pool.query(
            `INSERT INTO research (university_name, program_name, country, website, ranking, tuition_fees, requirements, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Researching') RETURNING *`,
            [university_name, program_name, country, website || null, ranking || null, tuition_fees || null, requirements || null, notes || null]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding research item:', err);
        res.status(500).json({ error: 'Failed to add item' });
    }
});

// Update a research item
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fields = ['university_name', 'program_name', 'country', 'website', 'ranking', 'tuition_fees', 'requirements', 'notes', 'status'];

        const updates = [];
        const values = [];

        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                values.push(req.body[field]);
                updates.push(`${field} = $${values.length}`);
            }
        });

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        values.push(id);
        const result = await pool.query(
            `UPDATE research SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating research item:', err);
        res.status(500).json({ error: 'Failed to update item' });
    }
});

// Update status (shortlist/reject)
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Researching', 'Shortlisted', 'Rejected', 'Applied'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            'UPDATE research SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating status:', err);
        res.status(500).json({ error: 'Failed to update status' });
    }
});

// Delete a research item
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'DELETE FROM research WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ success: true, deleted: result.rows[0] });
    } catch (err) {
        console.error('Error deleting research item:', err);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

module.exports = router;
