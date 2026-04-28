import React from 'react';
import { useAuction } from '../context/AuctionContext';

const TeamStatus = () => {
  const { userTeamId, teams, players } = useAuction();

  if (!userTeamId) return null;

  const team = teams.find(t => t._id === userTeamId);
  if (!team) return null;

  const teamPlayers = players.filter(p => p.soldTo === userTeamId);

  return (
    <div className="team-status card">
      <h3>My Team: {team.name}</h3>
      <div className="purse-display">
        <span className="label">Purse Remaining</span>
        <span className="amount">₹{team.purse}</span>
      </div>
      
      <div className="roster-container">
        <h4>Roster ({teamPlayers.length})</h4>
        {teamPlayers.length === 0 ? (
          <p className="no-players">No players acquired yet.</p>
        ) : (
          <ul className="roster-list">
            {teamPlayers.map(p => (
              <li key={p._id}>
                <span>{p.name}</span>
                <span className="player-skill">{p.skill}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TeamStatus;
