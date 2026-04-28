const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        purse: {
            type: Number,
            required: true,
            min: 0,
            default: 1000
        },
        players: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Player'
            }
        ],
        role: {
            type: String,
            enum: ['team-manager'],
            default: 'team-manager'
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Team', teamSchema);
