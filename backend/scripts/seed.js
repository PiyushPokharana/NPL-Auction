const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Player = require('../models/Player');
const Team = require('../models/Team');
const Bid = require('../models/Bid');
const AuctionState = require('../models/AuctionState');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/npl-auction';

const samplePlayers = [
    { name: 'Rohit Sharma', skill: 'batting', basePrice: 200 },
    { name: 'Virat Kohli', skill: 'batting', basePrice: 250 },
    { name: 'Jasprit Bumrah', skill: 'bowling', basePrice: 220 },
    { name: 'Ravindra Jadeja', skill: 'all-rounder', basePrice: 210 },
    { name: 'Kane Williamson', skill: 'batting', basePrice: 180 },
    { name: 'Mitchell Starc', skill: 'bowling', basePrice: 190 },
    { name: 'Ben Stokes', skill: 'all-rounder', basePrice: 230 },
    { name: 'KL Rahul', skill: 'batting', basePrice: 160 },
    { name: 'Trent Boult', skill: 'bowling', basePrice: 150 },
    { name: 'Shakib Al Hasan', skill: 'all-rounder', basePrice: 170 },
    { name: 'David Warner', skill: 'batting', basePrice: 140 },
    { name: 'Yuzvendra Chahal', skill: 'bowling', basePrice: 120 }
];

const sampleTeams = [
    { name: 'Team 1', purse: 1000 },
    { name: 'Team 2', purse: 1000 },
    { name: 'Team 3', purse: 1000 },
    { name: 'Team 4', purse: 1000 }
];

async function seed() {
    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to MongoDB');

        // Clear existing data (use with caution)
        await Bid.deleteMany({});
        await AuctionState.deleteMany({});
        await Player.deleteMany({});
        await Team.deleteMany({});

        // Create teams
        const teams = await Team.insertMany(sampleTeams);
        console.log(`Created ${teams.length} teams`);

        // Create players
        const players = await Player.insertMany(samplePlayers);
        console.log(`Created ${players.length} players`);

        // Initialize auction state
        const auctionState = new AuctionState();
        await auctionState.save();
        console.log('Initialized AuctionState');

        console.log('Seeding complete.');
    } catch (err) {
        console.error('Seeding error:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

seed();
