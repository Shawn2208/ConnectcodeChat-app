const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Message = require('../models/Message'); // Assuming you have a Message model

// --- General Room Routes ---
// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await Room.find(req.query.roomId);
        res.status(200).send(rooms);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Get a room by ID
router.get('/:roomId', async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId).populate('users').populate('messages');
        if (!room) {
            return res.status(404).send('Room not found');
        }
        res.status(200).send(room);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// --- Message Routes ---
router.post('/:roomId/messages', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).send('Room not found.');
        }

        const newMessage = new Message({
            type: 'message',
            message: req.body.content,
            sender: req.body.sender,
            roomId: room._id
        });

        console.log('New message before saving:', newMessage);
        await newMessage.save();

        console.log('New message after saving:', newMessage);

        room.messages.push(newMessage._id);
        await room.save();

        console.log('Room after adding message:', room);

        res.status(201).send(newMessage);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving the message.');
    }
});


router.post('/:roomId/messages', async (req, res) => {
    try {
        const roomId = req.params.roomId;
        const room = await Room.findById(roomId);
        
        if (!room) {
            return res.status(404).send('Room not found.');
        }

        const newMessage = new Message({
            type: 'message',
            message: req.body.content,
            sender: req.body.sender,
            roomId: room._id
        });
        
        await newMessage.save();

        // Console log the saved message and the room before updating
        console.log('New message saved:', newMessage);
        console.log('Room before adding message:', room);

        room.messages.push(newMessage._id);
        await room.save();

        // Console log the room after adding the message
        console.log('Room after adding message:', room);

        res.status(201).send(newMessage);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving the message.');
    }
});


router.post('/chat', async (req, res) => {
    try {
        const roomName = req.body.roomName;
        const room = await Room.findOne({ name: roomName });
        
        if (!room) {
            return res.status(404).send('Room not found.');
        }

        const newMessage = new Message({
            type: 'message',
            message: req.body.content,
            sender: req.body.sender, // You might get sender details differently, depending on your setup.
            roomId: room._id
        });
        
        await newMessage.save();
        room.messages.push(newMessage._id);
        await room.save();

        res.status(201).send(newMessage);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error saving the message.');
    }
});


// --- User Routes ---
// Add a user to a room
router.patch('/:roomId/addUser', async (req, res) => {
    try {
        const room = await Room.findById(req.params.roomId);
        if (!room) {
            return res.status(404).send('Room not found');
        }
        room.users.push(req.body.userId); // Assuming userId is passed in request body
        await room.save();
        res.status(200).send(room);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// You can add more routes as per your application's requirements.

module.exports = router;
