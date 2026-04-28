import React from 'react';
import { useAuction } from '../context/AuctionContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { userRole, setUserRole, userTeamId, setUserTeamId, teams } = useAuction();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUserRole(null);
    setUserTeamId(null);
    navigate('/');
  };

  const getTeamName = () => {
    if (!userTeamId) return '';
    const team = teams.find(t => t._id === userTeamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <header className="app-header">
      <div className="logo">NPL Auction</div>
      <div className="user-info">
        {userRole && (
          <>
            <span className="role-badge">
              {userRole === 'auctioneer' ? 'Auctioneer' : getTeamName()}
            </span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
