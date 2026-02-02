-- Master's Application Dashboard Schema

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS chat_history CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS applications CASCADE;

-- Applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    university_name VARCHAR(255) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    country VARCHAR(50) NOT NULL CHECK (country IN ('Germany', 'Switzerland')),
    deadline DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Submitted', 'Interview', 'Result')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Documents table (linked to applications)
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE UNIQUE,
    gre BOOLEAN DEFAULT FALSE,
    toefl_ielts BOOLEAN DEFAULT FALSE,
    lors BOOLEAN DEFAULT FALSE,
    sop BOOLEAN DEFAULT FALSE,
    transcript BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat history for AI agent
CREATE TABLE chat_history (
    id SERIAL PRIMARY KEY,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_applications_deadline ON applications(deadline);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_applications_country ON applications(country);
CREATE INDEX idx_chat_history_created ON chat_history(created_at);

-- Trigger to auto-create documents entry when application is created
CREATE OR REPLACE FUNCTION create_documents_for_application()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO documents (application_id) VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_documents
    AFTER INSERT ON applications
    FOR EACH ROW
    EXECUTE FUNCTION create_documents_for_application();

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_applications
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trigger_update_documents
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();

-- Insert sample data
INSERT INTO applications (university_name, program_name, country, deadline, status) VALUES
    ('Technical University of Munich', 'M.Sc. Computer Science', 'Germany', '2026-05-31', 'In Progress'),
    ('ETH Zurich', 'M.Sc. Data Science', 'Switzerland', '2026-03-15', 'Not Started'),
    ('RWTH Aachen', 'M.Sc. Software Systems Engineering', 'Germany', '2026-04-01', 'Not Started'),
    ('EPFL', 'M.Sc. Computer Science', 'Switzerland', '2026-04-15', 'In Progress'),
    ('TU Berlin', 'M.Sc. Computer Science', 'Germany', '2026-06-15', 'Not Started'),
    ('University of Zurich', 'M.Sc. Informatics', 'Switzerland', '2026-02-28', 'Submitted');

-- Update some document statuses
UPDATE documents SET gre = true, toefl_ielts = true, transcript = true WHERE application_id = 1;
UPDATE documents SET transcript = true WHERE application_id = 2;
UPDATE documents SET gre = true, toefl_ielts = true, lors = true, sop = true, transcript = true WHERE application_id = 6;
UPDATE documents SET gre = true, transcript = true, sop = true WHERE application_id = 4;
