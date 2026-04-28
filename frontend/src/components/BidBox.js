import React, { useState } from 'react';
import { useAuction } from '../context/AuctionContext';
import { emitPlaceBid } from '../services/socketService';

const BidBox = () => {
  const { currentPlayer, currentBid, userTeamId, teams, auctionActive } = useAuction();
  const [bidAmount, setBidAmount] = useState('');
  const [error, setError] = useState('');

  const myTeam = teams.find(t => t._id === userTeamId);

  const handleBid = (e) => {
    e.preventDefault();
    setError('');

    const amount = Number(bidAmount);

    if (!auctionActive) {
      const msg = "This player's auction has ended";
      console.warn(`[Validation Failure] ${msg}`);
      setError(msg);
      return;
    }
    if (amount <= currentBid) {
      const msg = `Your bid must be higher than ₹${currentBid}`;
      console.warn(`[Validation Failure] ${msg}`);
      setError(msg);
      return;
    }
    if (currentPlayer && amount < currentPlayer.basePrice) {
      const msg = `Bid must be at least ₹${currentPlayer.basePrice}`;
      console.warn(`[Validation Failure] ${msg}`);
      setError(msg);
      return;
    }
    if (myTeam && amount > myTeam.purse) {
      const msg = `You only have ₹${myTeam.purse} purse left`;
      console.warn(`[Validation Failure] ${msg}`);
      setError(msg);
      return;
    }

    console.log(`[Bid Placed] Team ${userTeamId} placed bid of ₹${amount} for player ${currentPlayer._id}`);
    emitPlaceBid(currentPlayer._id, userTeamId, amount);
    setBidAmount('');
  };

  if (!currentPlayer) return null;

  const minNextBid = Math.max(currentBid + 1, currentPlayer.basePrice);
  const purseExhausted = myTeam && myTeam.purse <= currentBid;

  return (
    <div className="bid-box card">
      <h3>Place a Bid</h3>
      {error && <div className="error-alert">{error}</div>}
      <form onSubmit={handleBid} className="bid-form">
        <div className="input-group">
          <span className="currency-symbol">₹</span>
          <input
            type="number"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            placeholder={`Min ₹${minNextBid}`}
            disabled={!auctionActive || purseExhausted}
            className="bid-input"
          />
        </div>
        {purseExhausted && (
          <div className="error-alert">You do not have enough purse to beat the current bid.</div>
        )}
        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={!auctionActive || !bidAmount || purseExhausted}
        >
          Place Bid
        </button>
      </form>
    </div>
  );
};

export default BidBox;
