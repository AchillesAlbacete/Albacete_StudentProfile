const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database Initialization
const db = new sqlite3.Database(path.join(__dirname, 'student_profile.db'), (err) => {
    if (err) console.error("Database connection error:", err.message);
    else console.log("Connected to SQLite database.");
});

// Create Students Table
db.serialize(() => {
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
    `);

    // Seed initial test account if table is empty
    db.get("SELECT COUNT(*) as count FROM students", [], (err, row) => {
        if (row && row.count === 0) {
            const hashedPassword = bcrypt.hashSync("password123", 10);
            const aboutData = JSON.stringify({
                aboutIntro: "I am Achilles A. Albacete, a third-year Bachelor of Science in Information Technology student at Ateneo de Cagayan - Xavier University.",
                aboutDetails: "I have lived in Cagayan de Oro City for nearly 11 years. During that time, I have learned to value discipline, determination, and continuous learning. College has taught me how to adapt, persevere, and stay focused when the workload becomes overwhelming. I enjoy quiet moments, thoughtful reflection, and learning new things independently, especially when they involve technology and digital systems.",
                aboutPersonality: "I am naturally an introvert, but I am curious and motivated to improve myself. I chose BSIT because it is practical and future-oriented, giving me opportunities to explore networking, web development, system processes, and technology-driven problem solving. Along the way, I am also developing patience, teamwork, resilience, and confidence."
            });

            db.run(`
                INSERT INTO students (student_id, password, name, course, year_level, about, skills, interests, education, goals, profile_picture)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                "2023-0001",
                hashedPassword,
                "Achilles Albacete",
                "BS Information Technology",
                "3rd Year",
                aboutData,
                "HTML, CSS, JavaScript, Networking",
                "Reading manhwa and manga; Learning how client and server devices work; Playing airsoft.",
                "Currently pursuing a Bachelor of Science in Information Technology at Ateneo de Cagayan - Xavier University.",
                "My long-term goal is to become a dependable software developer who contributes to meaningful projects and solves real-world problems. I want to keep growing in web development, networking, and system design while building a career grounded in responsibility, collaboration, and service.",
                ""
            ], () => console.log("Test account created with full profile data!"));
        }
    });
});

// LOGIN
app.post('/api/login', (req, res) => {
    const { studentId, password } = req.body;
    db.get("SELECT * FROM students WHERE student_id = ?", [studentId], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: "Invalid student ID or password." });
        }
        const { password: _, ...userData } = user;
        res.json({ message: "Login successful", user: userData });
    });
});

// READ PROFILE
app.get('/api/profile/:id', (req, res) => {
    db.get("SELECT student_id, name, course, year_level, about, skills, interests, education, goals, profile_picture FROM students WHERE student_id = ?", [req.params.id], (err, user) => {
        if (err || !user) return res.status(404).json({ error: "Profile not found." });
        res.json(user);
    });
});

// UPDATE PROFILE
app.put('/api/profile/:id', (req, res) => {
    const { name, course, year_level, about, skills, interests, education, goals, profile_picture } = req.body;
    db.run(`
        UPDATE students
        SET name = ?, course = ?, year_level = ?, about = ?, skills = ?, interests = ?, education = ?, goals = ?, profile_picture = ?
        WHERE student_id = ?
    `, [name, course, year_level, about, skills, interests, education, goals, profile_picture, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: "Unable to update profile." });
        res.json({ message: "Profile updated successfully." });
    });
});

// CREATE STUDENT
app.post('/api/students', (req, res) => {
    const { studentId, password, name, course, yearLevel } = req.body;
    const hashedPassword = bcrypt.hashSync(password || "123456", 10);

    db.run(`
        INSERT INTO students (student_id, password, name, course, year_level, about, skills, interests, education, goals, profile_picture)
        VALUES (?, ?, ?, ?, ?, '', '', '', '', '', '')
    `, [studentId, hashedPassword, name, course, yearLevel], (err) => {
        if (err) return res.status(400).json({ error: "Student ID already exists or invalid data." });
        res.status(201).json({ message: "Student record created successfully." });
    });
});

// DELETE STUDENT
app.delete('/api/students/:id', (req, res) => {
    db.run("DELETE FROM students WHERE student_id = ?", [req.params.id], function(err) {
        if (err || this.changes === 0) return res.status(400).json({ error: "Record delete failed or ID not found." });
        res.json({ message: "Student record deleted successfully." });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});