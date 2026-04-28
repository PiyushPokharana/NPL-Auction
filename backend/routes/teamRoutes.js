const express = require('express');
const {
    getTeams,
    updateTeamPurse,
    updateTeamRoster
} = require('../controllers/teamController');

const router = express.Router();

router.get('/', getTeams);
router.put('/:id/purse', updateTeamPurse);
router.put('/:id/roster', updateTeamRoster);

module.exports = router;
