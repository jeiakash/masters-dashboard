const express = require('express');
const router = express.Router();
const pool = require('../db');
const aiAgent = require('../services/aiAgent');

// Store for chat sessions (in production, use Redis or database)
const chatSessions = new Map();

// POST send message to AI
router.post('/', async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Get chat history for session
        const history = chatSessions.get(sessionId) || [];

        // Get AI response
        const response = await aiAgent.chat(message, history);

        // Update session history
        chatSessions.set(sessionId, response.history);

        // Save to database
        await pool.query(
            'INSERT INTO chat_history (role, content) VALUES ($1, $2)',
            ['user', message]
        );
        await pool.query(
            'INSERT INTO chat_history (role, content) VALUES ($1, $2)',
            ['assistant', response.message]
        );

        res.json({
            message: response.message,
            sessionId,
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            error: 'Failed to process message',
            details: error.message
        });
    }
});

// GET chat history
router.get('/history', async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        const result = await pool.query(
            'SELECT * FROM chat_history ORDER BY created_at DESC LIMIT $1',
            [limit]
        );
        res.json(result.rows.reverse());
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ error: 'Failed to fetch chat history' });
    }
});

// DELETE clear chat history
router.delete('/history', async (req, res) => {
    try {
        const { sessionId } = req.query;

        await pool.query('DELETE FROM chat_history');

        if (sessionId) {
            chatSessions.delete(sessionId);
        } else {
            chatSessions.clear();
        }

        res.json({ message: 'Chat history cleared' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ error: 'Failed to clear chat history' });
    }
});

module.exports = router;
