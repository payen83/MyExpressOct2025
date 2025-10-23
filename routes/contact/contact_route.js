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

router.get('/:id', (req, res) => {
    const contact = contacts.find(c => c.id == req.params.id);
    if(!contact) return res.status(404).send('Contact not found');

    res.render('contact/contact_details', {
        title: 'Contact Details',
        content: 'View your contact information',
        contact
    });
});

router.post('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = contacts.findIndex(c => c.id == id);
    if(index < 0) return res.status(404).send('Contact id not found');
    contacts.splice(index, 1);
    res.redirect('/contacts');
});

module.exports = router;