import React from 'react';

const PlayerCard = ({ player }) => {
  if (!player) return null;

  return (
    <div className="player-card">
      <div className="player-header">
        <h4>{player.name}</h4>
        <span className={`status-badge ${player.status}`}>{player.status}</span>
      </div>
      <div className="player-details">
        <div><span className="label">Skill:</span> <span className="capitalize">{player.skill}</span></div>
        <div><span className="label">Base Price:</span> ₹{player.basePrice}</div>
      </div>
    </div>
  );
};

export default PlayerCard;
