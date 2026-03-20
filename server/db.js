const mysql = require('mysql2');
require('dotenv').config(); // This line loads the variables from your .env file

// Pull the connection string from the environment variables
const connectionString = process.env.MYSQL_URL;

if (!connectionString) {
    console.error("❌ ERROR: MYSQL_URL is missing from .env file!");
    process.exit(1);
}

const pool = mysql.createPool(connectionString);

// Verify the connection works when you start the server
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Successfully connected to Railway MySQL database!');
        connection.release();
    }
});

module.exports = pool.promise();