import React, { useState, useEffect } from 'react';
import { getSocket } from '../services/socketService';
import { useAuction } from '../context/AuctionContext';

const LiveBidsList = () => {
  const [bids, setBids] = useState([]);
  const { teams } = useAuction();

  useEffect(() => {
    const socket = getSocket();
    
    const handleNewBid = (bidData) => {
      setBids(prev => [bidData, ...prev].slice(0, 10)); // Keep last 10 bids
    };
    
    const handleAuctionStarted = () => {
      setBids([]);
    };

    socket.on('newBid', handleNewBid);
    socket.on('auctionStarted', handleAuctionStarted);

    return () => {
      socket.off('newBid', handleNewBid);
      socket.off('auctionStarted', handleAuctionStarted);
    };
  }, []);

  const getTeamName = (teamId) => {
    const team = teams.find(t => t._id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <div className="live-bids-list card">
      <h3>Live Bids</h3>
      {bids.length === 0 ? (
        <p className="no-bids">No bids yet for this player.</p>
      ) : (
        <ul className="bids-feed">
          {bids.map((bid, index) => (
            <li key={index} className={`bid-item ${index === 0 ? 'latest-bid' : ''}`}>
              <span className="bid-team">{getTeamName(bid.teamId)}</span>
              <span className="bid-amount">₹{bid.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveBidsList;
