const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all applications with documents
router.get('/', async (req, res) => {
    try {
        const { country, status, search } = req.query;

        let query = `
      SELECT 
        a.*,
        json_build_object(
          'gre', d.gre,
          'toefl_ielts', d.toefl_ielts,
          'lors', d.lors,
          'sop', d.sop,
          'transcript', d.transcript
        ) as documents
      FROM applications a
      LEFT JOIN documents d ON a.id = d.application_id
      WHERE 1=1
    `;
        const params = [];

        if (country) {
            params.push(country);
            query += ` AND a.country = $${params.length}`;
        }

        if (status) {
            params.push(status);
            query += ` AND a.status = $${params.length}`;
        }

        if (search) {
            params.push(`%${search}%`);
            query += ` AND (a.university_name ILIKE $${params.length} OR a.program_name ILIKE $${params.length})`;
        }

        query += ' ORDER BY a.deadline ASC';

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// GET single application
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(`
      SELECT 
        a.*,
        json_build_object(
          'gre', d.gre,
          'toefl_ielts', d.toefl_ielts,
          'lors', d.lors,
          'sop', d.sop,
          'transcript', d.transcript
        ) as documents
      FROM applications a
      LEFT JOIN documents d ON a.id = d.application_id
      WHERE a.id = $1
    `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching application:', error);
        res.status(500).json({ error: 'Failed to fetch application' });
    }
});

// POST create new application
router.post('/', async (req, res) => {
    try {
        const { university_name, program_name, country, deadline, status, notes } = req.body;

        if (!university_name || !program_name || !country || !deadline) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await pool.query(`
      INSERT INTO applications (university_name, program_name, country, deadline, status, notes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [university_name, program_name, country, deadline, status || 'Not Started', notes || null]);

        // Fetch with documents (trigger auto-creates documents row)
        const fullResult = await pool.query(`
      SELECT 
        a.*,
        json_build_object(
          'gre', d.gre,
          'toefl_ielts', d.toefl_ielts,
          'lors', d.lors,
          'sop', d.sop,
          'transcript', d.transcript
        ) as documents
      FROM applications a
      LEFT JOIN documents d ON a.id = d.application_id
      WHERE a.id = $1
    `, [result.rows[0].id]);

        res.status(201).json(fullResult.rows[0]);
    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

// PUT update application
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { university_name, program_name, country, deadline, status, notes } = req.body;

        const result = await pool.query(`
      UPDATE applications 
      SET university_name = COALESCE($1, university_name),
          program_name = COALESCE($2, program_name),
          country = COALESCE($3, country),
          deadline = COALESCE($4, deadline),
          status = COALESCE($5, status),
          notes = COALESCE($6, notes)
      WHERE id = $7
      RETURNING *
    `, [university_name, program_name, country, deadline, status, notes, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // Fetch with documents
        const fullResult = await pool.query(`
      SELECT 
        a.*,
        json_build_object(
          'gre', d.gre,
          'toefl_ielts', d.toefl_ielts,
          'lors', d.lors,
          'sop', d.sop,
          'transcript', d.transcript
        ) as documents
      FROM applications a
      LEFT JOIN documents d ON a.id = d.application_id
      WHERE a.id = $1
    `, [id]);

        res.json(fullResult.rows[0]);
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// DELETE application
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM applications WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Application not found' });
        }

        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// PUT update documents for an application
router.put('/:id/documents', async (req, res) => {
    try {
        const { id } = req.params;
        const { gre, toefl_ielts, lors, sop, transcript } = req.body;

        const result = await pool.query(`
      UPDATE documents 
      SET gre = COALESCE($1, gre),
          toefl_ielts = COALESCE($2, toefl_ielts),
          lors = COALESCE($3, lors),
          sop = COALESCE($4, sop),
          transcript = COALESCE($5, transcript)
      WHERE application_id = $6
      RETURNING *
    `, [gre, toefl_ielts, lors, sop, transcript, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Documents not found for this application' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating documents:', error);
        res.status(500).json({ error: 'Failed to update documents' });
    }
});

// GET dashboard stats
router.get('/stats/summary', async (req, res) => {
    try {
        const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        COUNT(CASE WHEN status = 'Submitted' OR status = 'Interview' OR status = 'Result' THEN 1 END) as completed,
        MIN(CASE WHEN deadline >= CURRENT_DATE THEN deadline END) as next_deadline
      FROM applications
    `);

        const docStats = await pool.query(`
      SELECT 
        COUNT(CASE WHEN gre THEN 1 END) as gre_complete,
        COUNT(CASE WHEN toefl_ielts THEN 1 END) as toefl_complete,
        COUNT(CASE WHEN lors THEN 1 END) as lors_complete,
        COUNT(CASE WHEN sop THEN 1 END) as sop_complete,
        COUNT(CASE WHEN transcript THEN 1 END) as transcript_complete,
        COUNT(*) as total
      FROM documents
    `);

        res.json({
            ...stats.rows[0],
            documents: docStats.rows[0]
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

module.exports = router;
