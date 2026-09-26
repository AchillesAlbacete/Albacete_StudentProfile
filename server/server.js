const crypto = require('crypto');
const path = require('path');
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_TTL_MS = 30 * 60 * 1000;
const sessions = new Map();
const db = new sqlite3.Database(process.env.DATABASE_PATH || path.join(__dirname, 'student_profile.db'));

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const ready = new Promise((resolve, reject) => {
    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            course TEXT NOT NULL,
            year_level TEXT NOT NULL,
            about TEXT,
            skills TEXT,
            interests TEXT,
            education TEXT,
            goals TEXT,
            profile_picture TEXT
        )
    `, (createError) => {
        if (createError) return reject(createError);

        db.get('SELECT COUNT(*) AS count FROM students', [], (countError, row) => {
            if (countError) return reject(countError);
            if (!process.env.DEMO_STUDENT_PASSWORD || row.count > 0) return resolve();

            const about = JSON.stringify({
                aboutIntro: 'I am Achilles A. Albacete, a third-year Bachelor of Science in Information Technology student at Ateneo de Cagayan - Xavier University.',
                aboutDetails: 'I have lived in Cagayan de Oro City for nearly 11 years. During that time, I have learned to value discipline, determination, and continuous learning. College has taught me how to adapt, persevere, and stay focused when the workload becomes overwhelming. I enjoy quiet moments, thoughtful reflection, and learning new things independently, especially when they involve technology and digital systems.',
                aboutPersonality: 'I am naturally an introvert, but I am curious and motivated to improve myself. I chose BSIT because it is practical and future-oriented, giving me opportunities to explore networking, web development, system processes, and technology-driven problem solving. Along the way, I am also developing patience, teamwork, resilience, and confidence.'
            });

            bcrypt.hash(process.env.DEMO_STUDENT_PASSWORD, 10, (hashError, passwordHash) => {
                if (hashError) return reject(hashError);

                db.run(`
                    INSERT INTO students (student_id, password, name, course, year_level, about, skills, interests, education, goals, profile_picture)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    '2023-0001',
                    passwordHash,
                    'Achilles Albacete',
                    'BS Information Technology',
                    '3rd Year',
                    about,
                    'HTML, CSS, JavaScript, Networking',
                    'Reading manhwa and manga; Learning how client and server devices work; Playing airsoft.',
                    'Currently pursuing a Bachelor of Science in Information Technology at Ateneo de Cagayan - Xavier University.',
                    'My long-term goal is to become a dependable software developer who contributes to meaningful projects and solves real-world problems. I want to keep growing in web development, networking, and system design while building a career grounded in responsibility, collaboration, and service.',
                    ''
                ], (insertError) => insertError ? reject(insertError) : resolve());
            });
        });
    });
});

function run(sql, values) {
    return new Promise((resolve, reject) => {
        db.run(sql, values, function (error) {
            if (error) return reject(error);
            resolve({ changes: this.changes, lastID: this.lastID });
        });
    });
}

function get(sql, values) {
    return new Promise((resolve, reject) => {
        db.get(sql, values, (error, row) => error ? reject(error) : resolve(row));
    });
}

function requireSession(req, res, next) {
    const authorization = req.get('authorization') || '';
    const match = authorization.match(/^Bearer ([\w-]+)$/);
    const session = match && sessions.get(match[1]);

    if (!session || session.expiresAt <= Date.now()) {
        if (match) sessions.delete(match[1]);
        return res.status(401).json({ error: 'Authentication required. Please log in again.' });
    }

    req.sessionToken = match[1];
    req.studentId = session.studentId;
    next();
}

function requireOwnProfile(req, res, next) {
    if (req.params.id !== req.studentId) {
        return res.status(403).json({ error: 'You may only access your own profile.' });
    }
    next();
}

app.post('/api/login', async (req, res) => {
    const { studentId, password } = req.body || {};
    if (typeof studentId !== 'string' || !studentId.trim() || typeof password !== 'string' || !password) {
        return res.status(400).json({ error: 'Student ID and password are required.' });
    }

    try {
        const user = await get('SELECT * FROM students WHERE student_id = ?', [studentId.trim()]);
        if (!user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ error: 'Invalid student ID or password.' });
        }

        const token = crypto.randomBytes(32).toString('base64url');
        sessions.set(token, { studentId: user.student_id, expiresAt: Date.now() + SESSION_TTL_MS });
        const { password: _passwordHash, ...userData } = user;
        res.json({ message: 'Login successful', token, expiresIn: SESSION_TTL_MS, user: userData });
    } catch (error) {
        console.error('Login failed:', error.message);
        res.status(500).json({ error: 'Unable to authenticate. Please try again.' });
    }
});

app.post('/api/students', async (req, res) => {
    const { studentId, password, name, course, yearLevel } = req.body || {};
    if ([studentId, password, name, course, yearLevel].some((value) => typeof value !== 'string' || !value.trim())) {
        return res.status(400).json({ error: 'Student ID, password, name, course, and year level are required.' });
    }
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        await run(`
            INSERT INTO students (student_id, password, name, course, year_level, about, skills, interests, education, goals, profile_picture)
            VALUES (?, ?, ?, ?, ?, '', '', '', '', '', '')
        `, [studentId.trim(), passwordHash, name.trim(), course.trim(), yearLevel.trim()]);
        res.status(201).json({ message: 'Student profile created successfully.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            return res.status(409).json({ error: 'That student ID is already registered.' });
        }
        console.error('Student creation failed:', error.message);
        res.status(500).json({ error: 'Unable to create student profile.' });
    }
});

app.get('/api/session', requireSession, (req, res) => {
    res.json({ studentId: req.studentId });
});

app.post('/api/logout', requireSession, (req, res) => {
    sessions.delete(req.sessionToken);
    res.status(204).end();
});

app.get('/api/profile/:id', requireSession, requireOwnProfile, async (req, res) => {
    try {
        const profile = await get(`
            SELECT student_id, name, course, year_level, about, skills, interests, education, goals, profile_picture
            FROM students WHERE student_id = ?
        `, [req.params.id]);
        if (!profile) return res.status(404).json({ error: 'Profile not found.' });
        res.json(profile);
    } catch (error) {
        console.error('Profile retrieval failed:', error.message);
        res.status(500).json({ error: 'Unable to retrieve your profile. Please try again.' });
    }
});

app.put('/api/profile/:id', requireSession, requireOwnProfile, async (req, res) => {
    const { name, course, year_level, about, skills, interests, education, goals, profile_picture } = req.body || {};
    if ([name, course, year_level].some((value) => typeof value !== 'string' || !value.trim())) {
        return res.status(400).json({ error: 'Name, course, and year level are required.' });
    }

    try {
        const result = await run(`
            UPDATE students
            SET name = ?, course = ?, year_level = ?, about = ?, skills = ?, interests = ?, education = ?, goals = ?, profile_picture = ?
            WHERE student_id = ?
        `, [
            name.trim(), course.trim(), year_level.trim(),
            typeof about === 'string' ? about : '',
            typeof skills === 'string' ? skills : '',
            typeof interests === 'string' ? interests : '',
            typeof education === 'string' ? education : '',
            typeof goals === 'string' ? goals : '',
            typeof profile_picture === 'string' ? profile_picture : '',
            req.params.id
        ]);
        if (!result.changes) return res.status(404).json({ error: 'Profile not found.' });
        res.json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Profile update failed:', error.message);
        res.status(500).json({ error: 'Unable to update your profile.' });
    }
});

app.delete('/api/students/:id', requireSession, requireOwnProfile, async (req, res) => {
    try {
        const result = await run('DELETE FROM students WHERE student_id = ?', [req.params.id]);
        if (!result.changes) return res.status(404).json({ error: 'Student record not found.' });
        sessions.delete(req.sessionToken);
        res.json({ message: 'Student profile deleted successfully.' });
    } catch (error) {
        console.error('Student deletion failed:', error.message);
        res.status(500).json({ error: 'Unable to delete student profile.' });
    }
});

app.use((error, req, res, next) => {
    console.error('Request failed:', error.message);
    res.status(error.status || 500).json({ error: 'The request could not be completed.' });
});

function closeDatabase() {
    return new Promise((resolve, reject) => db.close((error) => error ? reject(error) : resolve()));
}

if (require.main === module) {
    ready.then(() => {
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on http://0.0.0.0:${PORT}`);
            if (!process.env.DEMO_STUDENT_PASSWORD) {
                console.log('Set DEMO_STUDENT_PASSWORD before first startup to seed the demonstration account.');
            }
        });
    }).catch((error) => {
        console.error('Database initialization failed:', error.message);
        process.exitCode = 1;
    });
}

module.exports = { app, ready, closeDatabase, sessions };