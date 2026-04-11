const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
    },
    board: {
        type: String,
        required: true,
        default: 'BSE Odisha'
    },
    upiId: {
        type: String,
        required: [true, 'UPI ID is required'],
        trim: true
    },
    screenshotPath: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'rejected'],
        default: 'pending'
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        default: 299
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);