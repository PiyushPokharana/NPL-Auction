const Player = require('../models/Player');

const getPlayers = async (req, res, next) => {
    try {
        const players = await Player.find().sort({ createdAt: -1 });
        res.json(players);
    } catch (error) {
        next(error);
    }
};

const getAvailablePlayers = async (req, res, next) => {
    try {
        const players = await Player.find({ status: 'available' }).sort({ createdAt: -1 });
        res.json(players);
    } catch (error) {
        next(error);
    }
};

const updatePlayerStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, soldTo } = req.body;

        if (!['available', 'sold'].includes(status)) {
            return res.status(400).json({ message: 'Invalid player status' });
        }

        const player = await Player.findByIdAndUpdate(
            id,
            { status, soldTo: soldTo || null },
            { new: true }
        );

        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.json(player);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPlayers,
    getAvailablePlayers,
    updatePlayerStatus
};
