import React from 'react';
import { useAuction } from '../context/AuctionContext';

const CurrentAuctionDisplay = () => {
  const { currentPlayer, currentBid, highestBidder, teams, auctionActive } = useAuction();

  if (!currentPlayer) {
    return (
      <div className="current-auction-placeholder card">
        <h3>Waiting for Auctioneer to select a player...</h3>
      </div>
    );
  }

  const getHighestBidderName = () => {
    if (!highestBidder) return 'None';
    const team = teams.find(t => t._id === highestBidder);
    return team ? team.name : 'None';
  };

  return (
    <div className="current-auction-display card">
      <div className="status-badge">
        {auctionActive ? <span className="active-dot pulse"></span> : null}
        {auctionActive ? 'Auction Live' : 'Auction Paused'}
      </div>
      <h2>{currentPlayer.name}</h2>
      <div className="player-details-grid">
        <div className="detail-item">
          <span className="label">Skill</span>
          <span className="value capitalize">{currentPlayer.skill}</span>
        </div>
        <div className="detail-item">
          <span className="label">Base Price</span>
          <span className="value">₹{currentPlayer.basePrice}</span>
        </div>
      </div>
      
      <div className="bid-status">
        <div className="current-bid-box">
          <span className="label">Current Bid</span>
          <span className="amount">₹{currentBid}</span>
        </div>
        <div className="highest-bidder-box">
          <span className="label">Highest Bidder</span>
          <span className="team-name">{getHighestBidderName()}</span>
        </div>
      </div>
    </div>
  );
};

export default CurrentAuctionDisplay;
