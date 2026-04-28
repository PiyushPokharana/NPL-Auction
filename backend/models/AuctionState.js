const mongoose = require('mongoose');

const auctionStateSchema = new mongoose.Schema(
    {
        currentPlayer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Player',
            default: null
        },
        currentBid: {
            type: Number,
            default: 0,
            min: 0
        },
        highestBidder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Team',
            default: null
        },
        auctionActive: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('AuctionState', auctionStateSchema);
