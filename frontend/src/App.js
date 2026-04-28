import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import LandingPage from './pages/LandingPage';
import AuctioneerPanel from './pages/AuctioneerPanel';
import TeamManagerPanel from './pages/TeamManagerPanel';
import Header from './components/Header';
import './index.css';

import { getSocket, initSocket } from './services/socketService';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { userRole } = useAuction();
  
  if (!userRole) {
    return <Navigate to="/" />;
  }
  
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/" />;
  }
  
  return children;
};

const AppContent = () => {
  const { globalError, setGlobalError } = useAuction();

  React.useEffect(() => {
    const socket = initSocket();
    
    const handleErrorMessage = (data) => {
      setGlobalError(data.message);
      setTimeout(() => setGlobalError(null), 5000); // clear after 5s
    };

    socket.on('errorMessage', handleErrorMessage);
    return () => {
      socket.off('errorMessage', handleErrorMessage);
    };
  }, [setGlobalError]);

  return (
    <div className="app">
      <Header />
      {globalError && (
        <div className="global-error-toast">
          {globalError}
          <button onClick={() => setGlobalError(null)}>&times;</button>
        </div>
      )}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/auctioneer" 
            element={
              <ProtectedRoute allowedRole="auctioneer">
                <AuctioneerPanel />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/team-manager" 
            element={
              <ProtectedRoute allowedRole="team-manager">
                <TeamManagerPanel />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuctionProvider>
      <Router>
        <AppContent />
      </Router>
    </AuctionProvider>
  );
}

export default App;
