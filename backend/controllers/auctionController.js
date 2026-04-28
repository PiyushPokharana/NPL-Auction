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
            console.warn('[Auction Start] missing playerId');
            return res.status(400).json({ message: 'playerId is required' });
        }

        const player = await Player.findById(playerId);
        if (!player) {
            console.warn('[Auction Start] player not found', { playerId });
            return res.status(404).json({ message: 'Player not found' });
        }

        if (player.status !== 'available') {
            console.warn('[Auction Start] player already sold', { playerId });
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

        console.log('[Auction Start] started', { playerId: player._id, basePrice: player.basePrice });

        const io = req.app.get('io');
        io.emit('auctionStarted', {
            player: player,
            currentBid: auctionState.currentBid,
            highestBidder: null,
            auctionActive: true
        });

        res.json(auctionState);
    } catch (error) {
        console.error('[Auction Start Error]', error);
        next(error);
    }
};

const acceptBid = async (req, res, next) => {
    try {
        const { playerId, teamId, amount } = req.body;

        if (!playerId || !teamId || !Number.isFinite(amount)) {
            console.warn('[Accept Bid] missing fields', { playerId, teamId, amount });
            return res.status(400).json({ message: 'playerId, teamId and amount are required' });
        }

        const auctionState = await getOrCreateAuctionState();

        if (!auctionState.auctionActive || String(auctionState.currentPlayer) !== String(playerId)) {
            console.warn('[Accept Bid] auction not active or mismatch', { playerId });
            return res.status(400).json({ message: 'Auction is not active for this player' });
        }

        if (String(auctionState.highestBidder) !== String(teamId) || auctionState.currentBid !== amount) {
            console.warn('[Accept Bid] provided bid is not current highest', { playerId, teamId, amount });
            return res.status(400).json({ message: 'Provided bid is not the current highest bid' });
        }

        const player = await Player.findById(playerId);
        const team = await Team.findOneAndUpdate(
            { _id: teamId, purse: { $gte: amount } },
            { $inc: { purse: -amount }, $addToSet: { players: playerId } },
            { new: true }
        );

        if (!player || !team) {
            console.warn('[Accept Bid] player or team invalid or insufficient purse', { playerId, teamId, amount });
            return res.status(400).json({ message: 'Player/team invalid or insufficient purse' });
        }

        console.log('[Accept Bid] accepted', { playerId, teamId, amount });

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
        console.error('[Accept Bid Error]', error);
        next(error);
    }
};

const rejectBid = async (req, res, next) => {
    try {
        const { playerId, teamId, amount } = req.body;

        if (!playerId || !teamId || !Number.isFinite(amount)) {
            console.warn('[Reject Bid] missing fields', { playerId, teamId, amount });
            return res.status(400).json({ message: 'playerId, teamId and amount are required' });
        }

        await Bid.findOneAndUpdate(
            { playerId, teamId, amount, status: 'placed' },
            { status: 'rejected' },
            { sort: { createdAt: -1 } }
        );

        const auctionState = await getOrCreateAuctionState();
        const io = req.app.get('io');
        io.emit('bidRejected', {
            playerId,
            teamId,
            amount,
            currentBid: auctionState.currentBid,
            highestBidder: auctionState.highestBidder
        });

        console.log('[Reject Bid] emitted', { playerId, teamId, amount });

        res.json({ message: 'Bid rejected' });
    } catch (error) {
        console.error('[Reject Bid Error]', error);
        next(error);
    }
};

module.exports = {
    startAuction,
    acceptBid,
    rejectBid,
    getOrCreateAuctionState
};
