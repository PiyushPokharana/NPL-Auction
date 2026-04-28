const AuctionState = require('../models/AuctionState');
const Bid = require('../models/Bid');
const Player = require('../models/Player');
const Team = require('../models/Team');

const getOrCreateAuctionState = async () => {
    let state = await AuctionState.findOne();
    if (!state) {
        state = await AuctionState.create({});
    }
    return state;
};

const startAuction = async (req, res, next) => {
    try {
        const { playerId } = req.body;

        if (!playerId) {
            return res.status(400).json({ message: 'playerId is required' });
        }

        const player = await Player.findById(playerId);
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        if (player.status !== 'available') {
            return res.status(400).json({ message: 'Player already sold' });
        }

        const auctionState = await getOrCreateAuctionState();

        if (auctionState.auctionActive) {
            return res.status(400).json({ message: 'Another auction is already active' });
        }

        auctionState.currentPlayer = player._id;
        auctionState.currentBid = player.basePrice;
        auctionState.highestBidder = null;
        auctionState.auctionActive = true;
        await auctionState.save();

        const io = req.app.get('io');
        io.emit('auctionStarted', {
            player: player,
            currentBid: auctionState.currentBid,
            highestBidder: null,
            auctionActive: true
        });

        res.json(auctionState);
    } catch (error) {
        next(error);
    }
};

const acceptBid = async (req, res, next) => {
    try {
        const { playerId, teamId, amount } = req.body;

        if (!playerId || !teamId || !Number.isFinite(amount)) {
            return res.status(400).json({ message: 'playerId, teamId and amount are required' });
        }

        const auctionState = await getOrCreateAuctionState();

        if (!auctionState.auctionActive || String(auctionState.currentPlayer) !== String(playerId)) {
            return res.status(400).json({ message: 'Auction is not active for this player' });
        }

        if (String(auctionState.highestBidder) !== String(teamId) || auctionState.currentBid !== amount) {
            return res.status(400).json({ message: 'Provided bid is not the current highest bid' });
        }

        const player = await Player.findById(playerId);
        const team = await Team.findOneAndUpdate(
            { _id: teamId, purse: { $gte: amount } },
            { $inc: { purse: -amount }, $addToSet: { players: playerId } },
            { new: true }
        );

        if (!player || !team) {
            return res.status(400).json({ message: 'Player/team invalid or insufficient purse' });
        }

        player.status = 'sold';
        player.soldTo = teamId;
        player.currentBid = amount;
        await player.save();

        await Bid.findOneAndUpdate(
            { playerId, teamId, amount, status: 'placed' },
            { status: 'accepted' },
            { sort: { createdAt: -1 } }
        );

        auctionState.currentPlayer = null;
        auctionState.currentBid = 0;
        auctionState.highestBidder = null;
        auctionState.auctionActive = false;
        await auctionState.save();

        const io = req.app.get('io');
        io.emit('bidAccepted', { 
            playerId, 
            teamId, 
            amount,
            updatedPlayer: player,
            updatedTeam: team 
        });
        io.emit('playerSold', { player });
        io.emit('auctionEnded', { playerId });

        res.json({ message: 'Bid accepted', player, team, auctionState });
    } catch (error) {
        next(error);
    }
};

const rejectBid = async (req, res, next) => {
    try {
        const { playerId, teamId, amount } = req.body;

        if (!playerId || !teamId || !Number.isFinite(amount)) {
            return res.status(400).json({ message: 'playerId, teamId and amount are required' });
        }

        await Bid.findOneAndUpdate(
            { playerId, teamId, amount, status: 'placed' },
            { status: 'rejected' },
            { sort: { createdAt: -1 } }
        );

        const io = req.app.get('io');
        io.emit('bidRejected', { playerId, teamId, amount });

        res.json({ message: 'Bid rejected' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startAuction,
    acceptBid,
    rejectBid,
    getOrCreateAuctionState
};
