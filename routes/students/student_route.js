const express = require('express');
const router = express.Router();
const db = require('../../database');

router.get('/', async(req, res) => {
    try {
        const [result] = await db.query("SELECT * FROM users");
        const students = result;
        res.render('students/students_view', {
            title: 'Student Management',
            content: 'View all student list',
            students
        });
    } catch(err){
        console.error(err);
    }
});

module.exports = router;