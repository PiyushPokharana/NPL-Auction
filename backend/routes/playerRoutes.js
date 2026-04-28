const express = require('express');
const {
    getPlayers,
    getAvailablePlayers,
    updatePlayerStatus
} = require('../controllers/playerController');

const router = express.Router();

router.get('/', getPlayers);
router.get('/available', getAvailablePlayers);
router.put('/:id/status', updatePlayerStatus);

module.exports = router;
