const express = require('express');
const router = express.Router();

const contacts = [
    {id: 1, name: "Khairul Adnan", phone: "0140900094"},
    {id: 2, name: "Amirah Hussein", phone: "0165545667"},
    {id: 3, name: "Lee Goon Hock", phone: "0156678896"}
]

router.get('/', (req,res) => {
    res.render('contact/contacts', {
        title: 'My Contact List',
        content: 'Manage & View Details of Contacts',
        contacts
    });
});

function renderFormPage(res, error = null) {
    res.render('contact/contact_form', {
        title: 'Add New Contact',
        content: 'Fill the Details',
        error,
        formAction: '/contacts/add'
    });
}

router.get('/add', (req, res) => renderFormPage(res));

router.post('/add', (req, res) => {
    const {name, phone} = req.body;
    const newContact = {
        id: contacts.length + 1,
        name: name,
        phone: phone
    };   
    contacts.push(newContact);
    res.redirect('/contacts');
});

module.exports = router;