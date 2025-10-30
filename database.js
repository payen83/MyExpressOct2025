const mysql = require('mysql2/promise');
require('dotenv').config();

const database = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

(async() => {
    try{
        const connection = await database.getConnection();
        console.log('Connected to MySQL Database!');
        connection.release();
    } catch(err) {
        console.log('Database connection failed:', err.message);
    }
})();
module.exports = database;