const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Import your Message model

// Route to handle sending messages
router.post('/send', async (req, res) => {
    try {
        const { sender, roomId, message } = req.body; // Extract sender, receiver, and message from the request body

        // Create and save the message
        const newMessage = new Message({
            sender: sender,
            roomId: roomId,
            message: message,
        });
        const savedMessage = await newMessage.save();

        // Return the saved message as a response
        res.status(200).json(savedMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
