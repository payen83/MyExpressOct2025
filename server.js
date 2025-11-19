const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('public'));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000','http://localhost:4200', 'https://mymahiroct2025.web.app', 'https://myexpressoct2025-production-15b2.up.railway.app'], 
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', 
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

// Display Images
app.use(
  "/api/files/images",
  express.static(path.join(__dirname, "files/images"))
);



app.get('/', (req, res)=> {
    res.send('Hello Express!!');
});

app.get('/about', (req, res) => {
    res.send('About us page');
});

app.get('/search', (req, res) => {
    const {q, page} = req.query;
    res.send(`Search keyword: ${q || 'no keyword'}. Page number: ${page||1}`);
});

const blogRoutes = require( './routes/blogRoutes' );
app.use( '/posts', blogRoutes );

const posting = [
    {id: 1, title: 'Hello Express'},
    {id: 2, title: 'Tips Express JS'}
]

app.get('/posting', (req, res) => {
    res.render('index', {title: 'My Posting', posting});
});

app.get('/posting/:id', (req, res)=>{
    const post = posting.find(p => p.id == Number(req.params.id));
    if(!post) return res.status(404).send('Post not found');
    res.render('post', {post});
});

const contactRoutes = require('./routes/contact/contact_route');
app.use('/contacts', contactRoutes);

const studentRoutes = require('./routes/students/student_route');
app.use('/students', studentRoutes);

const apiRoutes = require('./routes/api/studentapi_routes');
app.use('/api/students', apiRoutes);

const authRoutes = require('./routes/api/authapi_routes');
app.use('/api/auth', authRoutes);


// Report API Route
const reportApiRoutes = require("./routes/api/report_api.routes");
app.use("/api/reports", reportApiRoutes);


app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));