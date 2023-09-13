// Load environment variables from a `.env` file into `process.env`
require('dotenv').config();

// Dependencies and module imports
const express = require('express'); // Web framework for Node.js
const http = require('http'); // For creating an HTTP server
const path = require('path'); // For working with file and directory paths
const db = require('./config/db'); // Importing database configuration
const roomRoutes = require('./routes/roomRoutes'); // Import routes for room handling
const session = require('express-session'); // For session management in Express
const chatRoutes = require('./routes/chat'); // Import routes for chat handling
const userRoutes = require('./routes/userRoutes');
const Room = require('./models/Room');
const messageRoutes = require('./routes/messageRoutes');
const flash = require('connect-flash'); // For displaying one-time messages (like error messages)
const socketIo = require('socket.io'); // For WebSocket communication
const mongoose = require('mongoose'); // MongoDB object modeling tool
const passport = require('passport'); // For authentication strategies
require('./config/passport-config')(passport); // Import and configure authentication strategies
const local = require('passport-local'); // Local authentication strategy

// Middleware to ensure user is authenticated before accessing certain routes
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error_msg', 'Please log in to view this resource');
    res.redirect('/login');
}

// Connect to the database
db.connectDB();

// Initialize Express application
const app = express();
const server = http.createServer(app); // Create an HTTP server using Express

// Serve static files (like CSS, JavaScript) from the 'public' directory
app.use(express.static('public'));

// Configure Express to use EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse incoming JSON payloads
app.use(express.json());

// Set up session middleware to handle user sessions
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// Set up flash middleware for one-time messages
app.use(flash());

// Middleware to parse URL-encoded bodies (typically form data)
app.use(express.urlencoded({ extended: true }));

// Configure Socket.IO to handle CORS
const allowedOrigins = ["http://localhost:8080"];
const io = socketIo(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

// Initialize passport for authentication and enable session-based authentication
app.use(passport.initialize());
app.use(passport.session());

// Middleware to make flash messages available in templates
app.use((req, res, next) => {
    res.locals.messages = req.flash();
    next();
});

// Route handling
app.get('/', (req, res) => {
    res.render('main', {
        title: 'DevConnect',
        user: req.user, // Pass the user information to the template
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        title: 'DevConnect',
        user: req.user, // Pass the user information to the template
    });
    
});


app.get('/chat', ensureAuthenticated, async (req, res) => {
    try {
        const roomName = req.query.roomName; // Access roomName from the query parameters
        const room = await Room.findOne({ name: roomName });

        if (!room) {
            return res.status(404).send('Room not found.');
        }

        const messages = await Message.find({ roomId: room._id }); // Fetch messages based on roomId
        res.render('chat', {
            roomName: roomName,
            user: req.user,
            roomId: room._id.toString(), 
            messages: messages.reverse(),
            title: 'Chat Room'
        });
    } catch (error) {
        console.error("Error fetching messages:", error.message);
        res.status(500).send("Internal Server Error");
    }
    console.log("Query Parameters:", req.query); // Logging the query parameters for clarity
});




app.get('/register', (req, res) => {
    try {
        title = 'Register';
        user = req.user; // Pass the user information to the template
        res.render('register', {
            title: 'DevConnect',
            user: req.user,
        });
    } catch (error) {
        console.error("Error rendering registration page:", error);
        res.status(500).send("Internal Server Error"); // Display a generic error page or message
    }
});

app.get('/rooms', async (req, res) => {
    try {
        title = 'Rooms';
        user = req.user; // Pass the user information to the template
        const Room = require('./models/Room');
        const rooms = await Room.find(); // Fetch rooms from the database
        res.render('rooms', { rooms: rooms }); // Render 'rooms' view with fetched rooms
    } catch (error) {
        console.error("Error fetching rooms:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Handle user login using Passport
app.post('/login', passport.authenticate('local', {
    successRedirect: '/rooms',
    failureRedirect: '/login',
    failureFlash: true
}));
  
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error("Logout error:", err);
        }
        res.redirect('/login'); // Redirect the user to the login page after logout
    });
});


// Use route handlers defined in separate files
app.use('/rooms', roomRoutes);
app.use('/messages', messageRoutes);
app.use('/chat', chatRoutes);
app.use('/user', userRoutes);
const Message = require('./models/Message');

app.get('/main', (req, res) => {
    res.render('main', {
        title: 'Main Page',
        user: req.user
    });
});

require('./websocket/index')(io);

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});
