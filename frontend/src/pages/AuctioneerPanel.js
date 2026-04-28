import React, { useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { getSocket } from '../services/socketService';
import CurrentAuctionDisplay from '../components/CurrentAuctionDisplay';
import AuctionControls from '../components/AuctionControls';
import LiveBidsList from '../components/LiveBidsList';
import PlayerCard from '../components/PlayerCard';
import * as apiService from '../services/apiService';

const AuctioneerPanel = () => {
  const { setCurrentPlayer, setCurrentBid, setHighestBidder, setAuctionActive, players, setPlayers, setTeams } = useAuction();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [playersData, teamsData, auctionState] = await Promise.all([
          apiService.getPlayers(),
          apiService.getTeams(),
          apiService.getAuctionState()
        ]);
        setPlayers(playersData);
        setTeams(teamsData);

        if (auctionState && auctionState.auctionActive) {
          setCurrentPlayer(auctionState.currentPlayer);
          setCurrentBid(auctionState.currentBid);
          setHighestBidder(auctionState.highestBidder);
          setAuctionActive(auctionState.auctionActive);
        }
      } catch (error) {
        console.error('Error fetching initial data', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();

    const socket = getSocket();

    const handleAuctionStarted = (data) => {
      setCurrentPlayer(data.player);
      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
      setAuctionActive(true);
    };

    const handleNewBid = (data) => {
      setCurrentBid(data.amount);
      setHighestBidder(data.teamId);
    };

    const handleBidAccepted = (data) => {
      setCurrentPlayer(null);
      setCurrentBid(0);
      setHighestBidder(null);
      setAuctionActive(false);
      // We could fetch players/teams again or update state based on socket payload
      if (data.updatedPlayer) {
        setPlayers(prev => prev.map(p => p._id === data.updatedPlayer._id ? data.updatedPlayer : p));
      }
      if (data.updatedTeam) {
        setTeams(prev => prev.map(t => t._id === data.updatedTeam._id ? data.updatedTeam : t));
      }
    };

    const handleBidRejected = (data) => {
      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
    };

    socket.on('auctionStarted', handleAuctionStarted);
    socket.on('newBid', handleNewBid);
    socket.on('bidAccepted', handleBidAccepted);
    socket.on('bidRejected', handleBidRejected);

    return () => {
      socket.off('auctionStarted', handleAuctionStarted);
      socket.off('newBid', handleNewBid);
      socket.off('bidAccepted', handleBidAccepted);
      socket.off('bidRejected', handleBidRejected);
    };
  }, [setCurrentPlayer, setCurrentBid, setHighestBidder, setAuctionActive, setPlayers, setTeams]);

  if (isLoading) {
    return (
      <div className="panel-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="panel-container">
      <h2>Auctioneer Dashboard</h2>
      <div className="dashboard-grid">
        <div className="info-column">
          <CurrentAuctionDisplay />
        </div>
        <div className="auction-column">
          <AuctionControls />
        </div>
        <div className="team-column">
          <LiveBidsList />
        </div>
      </div>

      <div className="players-list-section">
        <h3>All Players</h3>
        <div className="players-grid">
          {players.map(p => (
            <PlayerCard key={p._id} player={p} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuctioneerPanel;
