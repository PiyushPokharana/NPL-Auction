const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');
const AuctionState = require('../models/AuctionState');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/npl-auction';

async function verify() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB for verification');

        const playerCount = await Player.countDocuments();
        const teamCount = await Team.countDocuments();
        const bidCount = await Bid.countDocuments();
        const auctionStateCount = await AuctionState.countDocuments();

        console.log('Counts:');
        console.log(`  Players: ${playerCount}`);
        console.log(`  Teams: ${teamCount}`);
        console.log(`  Bids: ${bidCount}`);
        console.log(`  AuctionStates: ${auctionStateCount}`);

        if (playerCount > 0) {
            const players = await Player.find().limit(5).select('name skill basePrice status currentBid soldTo').lean();
            console.log('\nSample players:');
            console.table(players);
        }

        if (teamCount > 0) {
            const teams = await Team.find().limit(5).select('name purse players').populate({ path: 'players', select: 'name' }).lean();
            console.log('\nSample teams:');
            teams.forEach(t => {
                console.log(`- ${t.name} (purse: ${t.purse}) players: ${t.players.map(p => p.name).join(', ')}`);
            });
        }

        if (auctionStateCount > 0) {
            const state = await AuctionState.findOne().populate('currentPlayer highestBidder', 'name');
            console.log('\nAuctionState:');
            console.log(state);
        }

    } catch (err) {
        console.error('Verification error:', err.message || err);
        process.exitCode = 2;
    } finally {
        await mongoose.disconnect();
    }
}

verify();
