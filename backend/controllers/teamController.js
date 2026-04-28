const Team = require('../models/Team');

const getTeams = async (req, res, next) => {
    try {
        const teams = await Team.find().populate('players').sort({ name: 1 });
        res.json(teams);
    } catch (error) {
        next(error);
    }
};

const updateTeamPurse = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;

        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        const team = await Team.findOneAndUpdate(
            { _id: id, purse: { $gte: amount } },
            { $inc: { purse: -amount } },
            { new: true }
        );

        if (!team) {
            return res.status(400).json({ message: 'Insufficient purse or team not found' });
        }

        res.json(team);
    } catch (error) {
        next(error);
    }
};

const updateTeamRoster = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { playerId } = req.body;

        if (!playerId) {
            return res.status(400).json({ message: 'playerId is required' });
        }

        const team = await Team.findById(id);

        if (!team) {
            return res.status(404).json({ message: 'Team not found' });
        }

        if (team.players.some((p) => String(p) === String(playerId))) {
            return res.status(400).json({ message: 'Player already in roster' });
        }

        team.players.push(playerId);
        await team.save();

        const updated = await Team.findById(id).populate('players');
        res.json(updated);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTeams,
    updateTeamPurse,
    updateTeamRoster
};
