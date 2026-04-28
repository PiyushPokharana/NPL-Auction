import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuction } from '../context/AuctionContext';
import apiService from '../services/apiService';

const LandingPage = () => {
  const { setUserRole, setUserTeamId, setTeams } = useAuction();
  const navigate = useNavigate();
  const [localTeams, setLocalTeams] = useState([]);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsData = await apiService.getTeams();
        setLocalTeams(teamsData);
        setTeams(teamsData);
      } catch (error) {
        console.error('Failed to fetch teams', error);
      }
    };
    fetchTeams();
  }, [setTeams]);

  const handleRoleSelection = (role, teamId = null) => {
    setUserRole(role);
    setUserTeamId(role === 'team-manager' ? teamId : null);
    
    if (role === 'auctioneer') {
      navigate('/auctioneer');
    } else {
      navigate('/team-manager');
    }
  };

  return (
    <div className="landing-container">
      <h1>NPL Auction System</h1>
      <h2>Select Your Role</h2>
      
      <div className="roles-container">
        <div className="role-card auctioneer-card">
          <h3>Auctioneer</h3>
          <p>Control the auction, start bidding, and accept/reject bids.</p>
          <button onClick={() => handleRoleSelection('auctioneer')} className="btn btn-primary">
            Join as Auctioneer
          </button>
        </div>

        <div className="role-card manager-card">
          <h3>Team Manager</h3>
          <p>Bid for players and build your dream team.</p>
          <div className="team-buttons">
            {localTeams.map((team) => (
              <button 
                key={team._id} 
                onClick={() => handleRoleSelection('team-manager', team._id)}
                className="btn btn-secondary"
              >
                Join as {team.name}
              </button>
            ))}
            {localTeams.length === 0 && <p>Loading teams...</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
