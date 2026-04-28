const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        skill: {
            type: String,
            enum: ['batting', 'bowling', 'all-rounder'],
            required: true
        },
        basePrice: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ['available', 'sold'],
            default: 'available'
        },
        soldTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        currentBid: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Player', playerSchema);
