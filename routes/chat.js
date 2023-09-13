// Import necessary modules
const express = require('express');
const router = express.Router();  // Express router for defining and managing routes
const Message = require('../models/Message');  // Importing the Message model/schema

// POST route for saving a new chat message
router.post('/', async (req, res) => {
    try {
        // Destructure the necessary fields from the request body
        const { content, roomId, userId } = req.body;

        // Create a new message instance using the provided details
        const message = new Message({
            content,
            roomId,
            userId
        });

        // Save the created message to the database
        await message.save();
        
        // Send back the saved message with a status code of 201 (Created)
        res.status(201).send(message);
    } catch (error) {
        // Handle any error that occurs during message creation and send back a status code of 500 (Internal Server Error)
        res.status(500).send(error.message);
    }
});

// GET route for rendering the chat room view
router.get('/', (req, res) => {
    // Render the 'chat' view and pass in necessary data for templating
    res.render('chat', {
        roomName: req.params.roomName,   // Getting the room name from the request query parameters
        user: req.user,                // Attaching user information to the view (assuming it's set elsewhere, e.g., during authentication)
        title: 'Chat Room'             // A static title for the chat room view
    });
});

// GET route for fetching chat messages based on a specific room ID
router.get('/:roomId', async (req, res) => {
    try {
        // Fetch messages from the database that match the provided room ID
        // Additionally, populate the 'userId' field to retrieve user details associated with each message
        const messages = await Message.find({ roomId: req.params.roomId }).populate('userId');
        
        // Send back the retrieved messages with a status code of 200 (OK)
        res.status(200).send(messages);
    } catch (error) {
        // Handle any error that occurs during message retrieval and send back a status code of 500 (Internal Server Error)
        res.status(500).send(error.message);
    }
});

// GET route for rendering the chat room view
router.get('/:roomName', async (req, res) => {
    try {
        // Fetch the room details from the database using the roomName from the route parameter
        const room = await Room.findOne({ name: req.params.roomName });

        if (!room) {
            // If room is not found, redirect to some error page or main page
            return res.redirect('/');
        }

        // Fetch recent messages for this room (assuming you want to show the last 50 messages)
        const messages = await Message.find({ roomId: room._id }).sort({ timestamp: -1 }).limit(50);

        // Render the chat.ejs template
        res.render('chat', {
            roomName: room.name,
            roomId: room._id.toString(),
            messages: messages.reverse(),
            user: req.user
        });

    } catch (error) {
        console.error("Error fetching chat room:", error);
        res.status(500).send("Server Error");
    }
});

// Export the router to be used elsewhere in the application
module.exports = router;
