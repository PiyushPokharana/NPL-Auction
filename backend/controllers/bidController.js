const Bid = require('../models/Bid');
const Team = require('../models/Team');
const Player = require('../models/Player');
const { getOrCreateAuctionState } = require('./auctionController');

const placeBid = async (req, res, next) => {
    try {
        const { playerId, teamId, amount } = req.body;

        if (!playerId || !teamId || !Number.isFinite(amount)) {
            return res.status(400).json({ message: 'playerId, teamId and amount are required' });
        }

        const [player, team, auctionState] = await Promise.all([
            Player.findById(playerId),
            Team.findById(teamId),
            getOrCreateAuctionState()
        ]);

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (!auctionState.auctionActive || String(auctionState.currentPlayer) !== String(playerId)) {
            return res.status(400).json({ message: 'Auction is not active for this player' });
        }

        if (player.status !== 'available') {
            return res.status(400).json({ message: 'Player already sold' });
        }

        if (amount <= auctionState.currentBid) {
            return res.status(400).json({ message: 'Bid must be higher than current bid' });
        }

        if (amount < player.basePrice) {
            return res.status(400).json({ message: `Bid must be at least ${player.basePrice}` });
        }

        if (team.purse < amount) {
            return res.status(400).json({ message: `Insufficient purse. You have ${team.purse} left` });
        }

        auctionState.currentBid = amount;
        auctionState.highestBidder = teamId;
        await auctionState.save();

        const bid = await Bid.create({
            playerId,
            teamId,
            amount,
            status: 'placed'
        });

        const io = req.app.get('io');
        io.emit('newBid', {
            playerId,
            teamId,
            amount,
            timestamp: bid.timestamp
        });

        res.status(201).json(bid);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    placeBid
};
