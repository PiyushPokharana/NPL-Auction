const express = require('express');
const { placeBid } = require('../controllers/bidController');

const router = express.Router();

router.post('/', placeBid);

module.exports = router;
