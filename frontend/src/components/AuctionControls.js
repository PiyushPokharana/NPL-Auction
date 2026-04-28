import React, { useState, useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { emitStartAuction, emitAcceptBid, emitRejectBid } from '../services/socketService';
import apiService from '../services/apiService';

const AuctionControls = () => {
  const { currentPlayer, currentBid, highestBidder, auctionActive, players, setPlayers } = useAuction();
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await apiService.getPlayers();
        setPlayers(data);
      } catch (error) {
        console.error('Failed to fetch players', error);
      }
    };
    fetchPlayers();
  }, [setPlayers]);

  const handleStartAuction = () => {
    if (!selectedPlayerId) return;
    emitStartAuction(selectedPlayerId);
  };

  const handleAcceptBid = () => {
    if (!currentPlayer || !highestBidder) return;
    emitAcceptBid(currentPlayer._id, highestBidder, currentBid);
  };

  const handleRejectBid = () => {
    if (!currentPlayer || !highestBidder) return;
    emitRejectBid(currentPlayer._id, highestBidder, currentBid);
  };

  const availablePlayers = players.filter(p => p.status === 'available');

  return (
    <div className="auction-controls card">
      <h3>Auction Controls</h3>
      
      {!auctionActive && !currentPlayer && (
        <div className="start-auction-form">
          <select 
            value={selectedPlayerId} 
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            className="player-select"
          >
            <option value="">-- Select Player to Auction --</option>
            {availablePlayers.map(p => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.skill}) - Base: ₹{p.basePrice}
              </option>
            ))}
          </select>
          <button 
            onClick={handleStartAuction} 
            disabled={!selectedPlayerId}
            className="btn btn-primary btn-block mt-2"
          >
            Start Auction
          </button>
        </div>
      )}

      {auctionActive && (
        <div className="active-controls">
          <p>Auction is live for <strong>{currentPlayer?.name}</strong></p>
          <div className="action-buttons">
            <button 
              onClick={handleAcceptBid} 
              disabled={!highestBidder}
              className="btn btn-success"
            >
              Accept Current Bid
            </button>
            <button 
              onClick={handleRejectBid} 
              disabled={!highestBidder}
              className="btn btn-danger"
            >
              Reject Current Bid
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionControls;
