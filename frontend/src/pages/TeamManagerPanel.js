import React, { useEffect } from 'react';
import { useAuction } from '../context/AuctionContext';
import { getSocket } from '../services/socketService';
import apiService from '../services/apiService';
import CurrentAuctionDisplay from '../components/CurrentAuctionDisplay';
import BidBox from '../components/BidBox';
import LiveBidsList from '../components/LiveBidsList';
import TeamStatus from '../components/TeamStatus';

const TeamManagerPanel = () => {
  const { setCurrentPlayer, setCurrentBid, setHighestBidder, setAuctionActive, setPlayers, setTeams, userTeamId, setGlobalSuccess, setGlobalError } = useAuction();
  const [isLoading, setIsLoading] = React.useState(true);

  useEffect(() => {
    // Initial fetch to make sure we have data if they reloaded the page
    const fetchInitialData = async () => {
      try {
        const [playersData, teamsData] = await Promise.all([
          apiService.getPlayers(),
          apiService.getTeams()
        ]);
        setPlayers(playersData);
        setTeams(teamsData);
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
      if (data.teamId === userTeamId) {
        setGlobalSuccess('Bid placed successfully!');
      }
    };

    const handleBidAccepted = (data) => {
      setCurrentPlayer(null);
      setCurrentBid(0);
      setHighestBidder(null);
      setAuctionActive(false);

      if (data.updatedPlayer) {
        setPlayers(prev => prev.map(p => p._id === data.updatedPlayer._id ? data.updatedPlayer : p));
      }
      if (data.updatedTeam) {
        setTeams(prev => prev.map(t => t._id === data.updatedTeam._id ? data.updatedTeam : t));
        if (data.updatedTeam._id === userTeamId) {
          setGlobalSuccess(`You won the player for ₹${data.amount}!`);
        }
      }
    };

    const handleBidRejected = (data) => {
      setCurrentBid(data.currentBid);
      setHighestBidder(data.highestBidder);
      if (data.teamId === userTeamId) {
        setGlobalError('Your bid was rejected by the auctioneer.');
      }
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
  }, [setCurrentPlayer, setCurrentBid, setHighestBidder, setAuctionActive, setPlayers, setTeams, userTeamId, setGlobalSuccess, setGlobalError]);

  if (isLoading) {
    return (
      <div className="panel-container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <h2>Loading Dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="panel-container">
      <h2>Team Manager Dashboard</h2>
      <div className="dashboard-grid">
        <div className="info-column">
          <CurrentAuctionDisplay />
        </div>
        <div className="auction-column">
          <BidBox />
          <LiveBidsList />
        </div>
        <div className="team-column">
          <TeamStatus />
        </div>
      </div>
    </div>
  );
};

export default TeamManagerPanel;
