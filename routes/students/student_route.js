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

function renderFormPage(res, error = null, student = null){
    const isUpdate = !!student;
    res.render('students/student_form', {
        title: 'Student Management',
        content: isUpdate ? 'Update Student':'Add New Student',
        error,
        student,
        formAction: isUpdate ? `/students/update/${student.id}?_method=PUT` : '/students/add'
    });
}

router.get('/update/:id', async (req,res)=>{
    try{
        const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if(rows.length == 0) return res.status(404).send('Student not found');
        const student = rows[0];
        renderFormPage(res, null, student);
    } catch(err){
        console.error(err);
        res.status(500).send('DB query failed, please check your DB');
    }
});

router.post('/update/:id', async (req,res) => {
    const { name, student_no, email, phone } = req.body;
    if(!name || name.trim() == '') return renderFormPage(res, 'Name cannot be empty');
    //student number must be a number
    if(!student_no || !/^\d+$/.test(student_no)) {
        return renderFormPage(res, 'Student no is required and must be in number format');
    }
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return renderFormPage(res, 'Email no is required and must be in email format');
    }
    if(!/^\d+$/.test(phone)) {
        return renderFormPage(res, 'Phone must be in number format');
    }
    try{
        const [result] = await db.query(
            'UPDATE users SET name = ?, student_no = ?, email = ?, phone = ? WHERE id = ?',
            [name, student_no, email, phone, req.params.id]
        );
        if(result.affectedRows === 0) return res.status(404).send('Student not found');
        res.redirect('/students');
    } catch(err){
        console.error(err);
        renderFormPage(res, 'Database error. Failed to update Students. Please check DB');
    }
})


router.get('/add', (req, res) => renderFormPage(res));

router.post('/add', async(req, res) => {
    const { name, student_no, email, phone } = req.body;

    if(!name || name.trim() == '') return renderFormPage(res, 'Name cannot be empty');
    //student number must be a number
    if(!student_no || !/^\d+$/.test(student_no)) {
        return renderFormPage(res, 'Student no is required and must be in number format');
    }
    if(!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return renderFormPage(res, 'Email no is required and must be in email format');
    }
    if(!/^\d+$/.test(phone)) {
        return renderFormPage(res, 'Phone must be in number format');
    }

    try{
        await db.query('INSERT INTO users(name, student_no, email, phone, type) VALUES(?,?,?,?,?)', 
            [name, student_no, email, phone, 'student']);
        res.redirect('/students');
    }catch(err){
        console.error(err);
        renderFormPage(res, 'DATABASE ERROR. PLEASE CHECK AT THE DB LOG.');
    }
});

module.exports = router;