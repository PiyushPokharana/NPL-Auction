import React, { createContext, useContext, useState, useEffect } from 'react';

const AuctionContext = createContext();

export const useAuction = () => useContext(AuctionContext);

export const AuctionProvider = ({ children }) => {
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  
  // Persist role and teamId so refresh doesn't break
  const [userRole, setUserRole] = useState(localStorage.getItem('npl_role') || null); // "auctioneer" | "team-manager"
  const [userTeamId, setUserTeamId] = useState(localStorage.getItem('npl_teamId') || null);
  
  const [auctionActive, setAuctionActive] = useState(false);
  const [globalError, setGlobalError] = useState(null);
  const [globalSuccess, setGlobalSuccess] = useState(null);

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('npl_role', userRole);
    } else {
      localStorage.removeItem('npl_role');
    }
  }, [userRole]);

  useEffect(() => {
    if (userTeamId) {
      localStorage.setItem('npl_teamId', userTeamId);
    } else {
      localStorage.removeItem('npl_teamId');
    }
  }, [userTeamId]);

  return (
    <AuctionContext.Provider
      value={{
        currentPlayer, setCurrentPlayer,
        currentBid, setCurrentBid,
        highestBidder, setHighestBidder,
        teams, setTeams,
        players, setPlayers,
        userRole, setUserRole,
        userTeamId, setUserTeamId,
        auctionActive, setAuctionActive,
        globalError, setGlobalError,
        globalSuccess, setGlobalSuccess
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};
