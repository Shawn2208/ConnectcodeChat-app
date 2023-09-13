const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  type: String,
  message: String,
  sender: String,
  roomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema);

