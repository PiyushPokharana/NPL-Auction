const Bid = require('../models/Bid');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { getOrCreateAuctionState } = require('./auctionController');

const placeBid = async (req, res, next) => {
    try {
        const { playerId, teamId, amount } = req.body;

        if (!playerId || !teamId || !Number.isFinite(amount)) {
            console.warn('[Bid Validation] missing fields', { playerId, teamId, amount });
            return res.status(400).json({ message: 'playerId, teamId and amount are required' });
        }

        const [player, team, auctionState] = await Promise.all([
            Player.findById(playerId),
            Team.findById(teamId),
            getOrCreateAuctionState()
        ]);

        if (!player) {
            console.warn('[Bid Validation] player not found', { playerId });
            return res.status(404).json({ message: 'Player not found' });
        }

        if (!team) {
            console.warn('[Bid Validation] team not found', { teamId });
            return res.status(404).json({ message: 'Team not found' });
        }

        if (!auctionState.auctionActive || String(auctionState.currentPlayer) !== String(playerId)) {
            console.warn('[Bid Validation] auction not active for player', { playerId });
            return res.status(400).json({ message: 'Auction is not active for this player' });
        }

        if (player.status !== 'available') {
            console.warn('[Bid Validation] player already sold', { playerId });
            return res.status(400).json({ message: 'Player already sold' });
        }

        if (amount <= auctionState.currentBid) {
            console.warn('[Bid Validation] bid too low', { amount, currentBid: auctionState.currentBid });
            return res.status(400).json({ message: 'Bid must be higher than current bid' });
        }

        if (amount < player.basePrice) {
            console.warn('[Bid Validation] below base price', { amount, basePrice: player.basePrice });
            return res.status(400).json({ message: `Bid must be at least ₹${player.basePrice}` });
        }

        if (team.purse < amount) {
            console.warn('[Bid Validation] insufficient purse', { teamId, purse: team.purse, attempted: amount });
            return res.status(400).json({ message: `Insufficient purse. You have ₹${team.purse} left` });
        }

        auctionState.currentBid = amount;
        auctionState.highestBidder = teamId;
        await auctionState.save();

        console.log('[Bid] updating auctionState', { playerId, teamId, amount });

        const bid = await Bid.create({
            playerId,
            teamId,
            amount,
            status: 'placed'
        });

        console.log('[Bid] saved', { bidId: bid._id, playerId, teamId, amount });

        const io = req.app.get('io');
        if (io) {
            io.emit('newBid', {
                playerId,
                teamId,
                amount,
                timestamp: bid.timestamp
            });
        }

        res.status(201).json(bid);
    } catch (error) {
        console.error('[Bid Error]', error);
        next(error);
    }
};

module.exports = {
    placeBid
};
