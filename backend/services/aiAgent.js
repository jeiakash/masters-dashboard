const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../db');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Tool definitions for function calling
const tools = [
    {
        name: 'get_all_applications',
        description: 'Get all university applications with their documents and status',
        parameters: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'search_applications',
        description: 'Search applications by university name, program, or country',
        parameters: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Search query' },
                country: { type: 'string', enum: ['Germany', 'Switzerland'], description: 'Filter by country' },
                status: { type: 'string', enum: ['Not Started', 'In Progress', 'Submitted', 'Interview', 'Result'] }
            }
        }
    },
    {
        name: 'add_application',
        description: 'Add a new university application',
        parameters: {
            type: 'object',
            properties: {
                university_name: { type: 'string', description: 'Name of the university' },
                program_name: { type: 'string', description: 'Name of the program (e.g., M.Sc. Computer Science)' },
                country: { type: 'string', enum: ['Germany', 'Switzerland'] },
                deadline: { type: 'string', description: 'Application deadline in YYYY-MM-DD format' },
                notes: { type: 'string', description: 'Optional notes' }
            },
            required: ['university_name', 'program_name', 'country', 'deadline']
        }
    },
    {
        name: 'update_application_status',
        description: 'Update the status of an application',
        parameters: {
            type: 'object',
            properties: {
                application_id: { type: 'number', description: 'ID of the application' },
                status: { type: 'string', enum: ['Not Started', 'In Progress', 'Submitted', 'Interview', 'Result'] }
            },
            required: ['application_id', 'status']
        }
    },
    {
        name: 'update_documents',
        description: 'Update document completion status for an application',
        parameters: {
            type: 'object',
            properties: {
                application_id: { type: 'number' },
                gre: { type: 'boolean' },
                toefl_ielts: { type: 'boolean' },
                lors: { type: 'boolean' },
                sop: { type: 'boolean' },
                transcript: { type: 'boolean' }
            },
            required: ['application_id']
        }
    },
    {
        name: 'get_dashboard_summary',
        description: 'Get a summary of all applications including total count, completion rate, and upcoming deadlines',
        parameters: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'get_upcoming_deadlines',
        description: 'Get applications with upcoming deadlines in the next N days',
        parameters: {
            type: 'object',
            properties: {
                days: { type: 'number', description: 'Number of days to look ahead', default: 30 }
            }
        }
    },
    {
        name: 'get_preparation_status',
        description: 'Get status of preparation items (German course, GRE, IELTS)',
        parameters: { type: 'object', properties: {}, required: [] }
    },
    {
        name: 'add_preparation_item',
        description: 'Add a new preparation tracking item',
        parameters: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['german', 'gre', 'ielts'], description: 'Type of preparation' },
                title: { type: 'string', description: 'Title of the milestone or goal' },
                target_date: { type: 'string', description: 'Target date in YYYY-MM-DD format' },
                notes: { type: 'string' }
            },
            required: ['type', 'title']
        }
    }
];

// Execute tool functions
async function executeFunction(name, args) {
    switch (name) {
        case 'get_all_applications': {
            const result = await pool.query(`
        SELECT a.*, 
          json_build_object(
            'gre', d.gre, 'toefl_ielts', d.toefl_ielts, 
            'lors', d.lors, 'sop', d.sop, 'transcript', d.transcript
          ) as documents
        FROM applications a
        LEFT JOIN documents d ON a.id = d.application_id
        ORDER BY a.deadline ASC
      `);
            return result.rows;
        }

        case 'search_applications': {
            let query = `
        SELECT a.*, 
          json_build_object(
            'gre', d.gre, 'toefl_ielts', d.toefl_ielts, 
            'lors', d.lors, 'sop', d.sop, 'transcript', d.transcript
          ) as documents
        FROM applications a
        LEFT JOIN documents d ON a.id = d.application_id
        WHERE 1=1
      `;
            const params = [];

            if (args.query) {
                params.push(`%${args.query}%`);
                query += ` AND (a.university_name ILIKE $${params.length} OR a.program_name ILIKE $${params.length})`;
            }
            if (args.country) {
                params.push(args.country);
                query += ` AND a.country = $${params.length}`;
            }
            if (args.status) {
                params.push(args.status);
                query += ` AND a.status = $${params.length}`;
            }

            query += ' ORDER BY a.deadline ASC';
            const result = await pool.query(query, params);
            return result.rows;
        }

        case 'add_application': {
            const result = await pool.query(
                `INSERT INTO applications (university_name, program_name, country, deadline, notes)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [args.university_name, args.program_name, args.country, args.deadline, args.notes || null]
            );
            return { success: true, application: result.rows[0] };
        }

        case 'update_application_status': {
            const result = await pool.query(
                'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
                [args.status, args.application_id]
            );
            return result.rows[0] ? { success: true, application: result.rows[0] } : { success: false, error: 'Application not found' };
        }

        case 'update_documents': {
            const updates = [];
            const values = [args.application_id];

            ['gre', 'toefl_ielts', 'lors', 'sop', 'transcript'].forEach(field => {
                if (args[field] !== undefined) {
                    values.push(args[field]);
                    updates.push(`${field} = $${values.length}`);
                }
            });

            if (updates.length === 0) return { success: false, error: 'No updates provided' };

            const result = await pool.query(
                `UPDATE documents SET ${updates.join(', ')} WHERE application_id = $1 RETURNING *`,
                values
            );
            return { success: true, documents: result.rows[0] };
        }

        case 'get_dashboard_summary': {
            const stats = await pool.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'Submitted' OR status = 'Result') as completed,
          COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress,
          MIN(deadline) FILTER (WHERE deadline > NOW()) as next_deadline
        FROM applications
      `);

            const nextApp = await pool.query(`
        SELECT university_name, program_name, deadline 
        FROM applications 
        WHERE deadline > NOW() 
        ORDER BY deadline ASC LIMIT 1
      `);

            return {
                ...stats.rows[0],
                next_deadline_app: nextApp.rows[0] || null
            };
        }

        case 'get_upcoming_deadlines': {
            const days = parseInt(args.days, 10) || 30;
            const result = await pool.query(`
        SELECT university_name, program_name, country, deadline, status
        FROM applications
        WHERE deadline BETWEEN NOW() AND NOW() + ($1 || ' days')::interval
        ORDER BY deadline ASC
      `, [days]);
            return result.rows;
        }

        case 'get_preparation_status': {
            const result = await pool.query(`
        SELECT * FROM preparation ORDER BY target_date ASC
      `);
            return result.rows.length > 0 ? result.rows : { message: 'No preparation items tracked yet. Add some using add_preparation_item.' };
        }

        case 'add_preparation_item': {
            const result = await pool.query(
                `INSERT INTO preparation (type, title, target_date, notes, completed)
         VALUES ($1, $2, $3, $4, false) RETURNING *`,
                [args.type, args.title, args.target_date || null, args.notes || null]
            );
            return { success: true, item: result.rows[0] };
        }

        default:
            return { error: `Unknown function: ${name}` };
    }
}

// Format tools for Gemini
const geminiTools = [{
    functionDeclarations: tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
    }))
}];

// Main chat function
async function chat(userMessage, history = []) {
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        tools: geminiTools
    });

    const systemPrompt = `You are a helpful assistant for a Master's degree application tracker. 
You help the user manage their applications to universities in Germany and Switzerland.
You can search, add, and update applications, track document preparation, and provide summaries.
You also help track preparation for German language courses, GRE, and IELTS.

The user is targeting Fall 2027 intake, so they have time to research and prepare.

Be concise and helpful. When adding applications, confirm the details with the user.
When showing data, format it nicely with bullet points or short summaries.`;

    // Build chat history
    const chatHistory = [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: "I understand. I'm ready to help you manage your Master's applications and preparation tracking." }] },
        ...history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }))
    ];

    const chatSession = model.startChat({ history: chatHistory });

    try {
        let response = await chatSession.sendMessage(userMessage);
        let result = response.response;

        // Handle function calls
        while (result.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
            const functionCalls = result.candidates[0].content.parts.filter(p => p.functionCall);
            const functionResponses = [];

            for (const part of functionCalls) {
                const { name, args } = part.functionCall;
                console.log(`Executing function: ${name}`, args);

                try {
                    const funcResult = await executeFunction(name, args || {});
                    functionResponses.push({
                        functionResponse: {
                            name,
                            response: { result: funcResult }
                        }
                    });
                } catch (err) {
                    console.error(`Function ${name} error:`, err);
                    functionResponses.push({
                        functionResponse: {
                            name,
                            response: { error: err.message }
                        }
                    });
                }
            }

            response = await chatSession.sendMessage(functionResponses);
            result = response.response;
        }

        const textContent = result.candidates?.[0]?.content?.parts
            ?.filter(p => p.text)
            ?.map(p => p.text)
            ?.join('\n') || 'I processed your request.';

        return textContent;
    } catch (error) {
        console.error('Gemini API error:', error);
        throw error;
    }
}

module.exports = { chat, executeFunction };
