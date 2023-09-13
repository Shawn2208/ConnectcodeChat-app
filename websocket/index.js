const mongoose = require('mongoose');
const Message = require('../models/Message');
const Room = require('../models/Room');

module.exports = function(io) {
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Generate a random user ID
        const randomUserId = `dev${Math.floor(Math.random() * 1000)}`;

        // Listen for a user wanting to join a room
        socket.on('joinRoom', (data) => {
            socket.join(data.roomId);
        });

        // Listen for a user wanting to leave a room
        socket.on('leaveRoom', (data) => {
            socket.leave(data.roomId);
        });

        socket.on('message', async (message) => {
            try {
                const isValidObjectId = mongoose.Types.ObjectId.isValid(message.roomId);
                if (isValidObjectId) {
                    const newMessage = new Message({
                        type: message.type,
                        message: message.message,
                        sender: randomUserId, // Use the random user ID here
                        roomId: new mongoose.Types.ObjectId(message.roomId)
                    });

                    const savedMessage = await newMessage.save();

                    await Room.findByIdAndUpdate(savedMessage.roomId, {
                        $push: { messages: savedMessage._id }
                    });

                    // Broadcast the message to all users in the room
                    io.to(message.roomId).emit('message', {
                        type: savedMessage.type,
                        message: savedMessage.message,
                        sender: savedMessage.sender
                    });

                } else {
                    console.error('Invalid receiver ObjectId:', message.roomId);
                }
            } catch (error) {
                console.error('Error saving message:', error);
            }
        });

        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
};
