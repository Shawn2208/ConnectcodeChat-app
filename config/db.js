// Import the mongoose library, which provides a straightforward, schema-based solution to model your application data
// and includes built-in type casting, validation, query building, and more out of the box.
const mongoose = require('mongoose');

// 'dotenv' is a zero-dependency module that loads environment variables from a .env file into process.env.
require('dotenv').config('.env');

// Retrieve the database connection string from the environment variables.
// This ensures sensitive data like database credentials are not hardcoded.
const DB_URI = process.env.DB_URI;

// Define an asynchronous function to establish a connection to the database.
async function connectDB() {
    try {
        // Attempt to connect to the MongoDB database using mongoose.
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,          // Use the new MongoDB Node.js driver connection string parser.
            useUnifiedTopology: true,       // Use the new server discovery and monitoring engine.
        });

        // Log a success message to the console if the connection is established.
        console.log('Connected to MongoDB');
    } catch (error) {
        // Log any errors that occur during the connection.
        console.error('connection error:', error);
        // Exit the Node.js process with a failure status. 1 indicates an unsuccessful exit.
        process.exit(1);
    }
}

// Export the connectDB function to be imported and used in other parts of the application.
module.exports = {
    connectDB
};



