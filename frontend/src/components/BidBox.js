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
      setError('Auction is not active.');
      return;
    }
    if (amount <= currentBid) {
      setError(`Bid must be higher than ₹${currentBid}`);
      return;
    }
    if (currentPlayer && amount < currentPlayer.basePrice) {
      setError(`Bid must be at least ₹${currentPlayer.basePrice}`);
      return;
    }
    if (myTeam && amount > myTeam.purse) {
      setError(`Insufficient purse. You have ₹${myTeam.purse} left.`);
      return;
    }

    emitPlaceBid(currentPlayer._id, userTeamId, amount);
    setBidAmount('');
  };

  if (!currentPlayer) return null;

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
            placeholder={`Min ₹${Math.max(currentBid + 1, currentPlayer.basePrice)}`}
            disabled={!auctionActive}
            className="bid-input"
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary btn-block"
          disabled={!auctionActive || !bidAmount}
        >
          Place Bid
        </button>
      </form>
    </div>
  );
};

export default BidBox;
