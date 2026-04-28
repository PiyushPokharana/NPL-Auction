const express = require('express');
const {
    startAuction,
    acceptBid,
    rejectBid
} = require('../controllers/auctionController');

const router = express.Router();

router.post('/start', startAuction);
router.post('/accept-bid', acceptBid);
router.post('/reject-bid', rejectBid);

module.exports = router;
