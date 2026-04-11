const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    scheduledAt: { type: Date, required: true },
    duration: Number,
    meetingLink: { type: String, required: true },
    recordingUrl: String,
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LiveSession', liveSessionSchema);