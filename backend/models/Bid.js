const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema(
    {
        playerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            required: true
        },
        teamId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            required: true
        },
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        status: {
            type: String,
            enum: ['placed', 'accepted', 'rejected'],
            default: 'placed'
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Bid', bidSchema);
