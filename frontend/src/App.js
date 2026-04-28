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
  const { globalError, setGlobalError, globalSuccess, setGlobalSuccess } = useAuction();

  React.useEffect(() => {
    const socket = initSocket();

    const handleErrorMessage = (data) => {
      setGlobalError(data.message);
    };

    socket.on('errorMessage', handleErrorMessage);
    const handleConnect = () => {
      setGlobalError(null);
      setGlobalSuccess('Connected');
      setTimeout(() => setGlobalSuccess(null), 2000);
    };

    const handleDisconnect = () => {
      setGlobalError('Connection Lost: Connecting... (Auto-reconnect in progress)');
    };

    const handleConnectError = () => {
      setGlobalError('Connection Lost: Connecting... (Auto-reconnect in progress)');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    return () => {
      socket.off('errorMessage', handleErrorMessage);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [setGlobalError]);

  React.useEffect(() => {
    if (globalError) {
      const timer = setTimeout(() => setGlobalError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [globalError, setGlobalError]);

  React.useEffect(() => {
    if (globalSuccess) {
      const timer = setTimeout(() => setGlobalSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [globalSuccess, setGlobalSuccess]);

  return (
    <div className="app">
      <Header />
      {globalError && (
        <div className="global-error-toast">
          {globalError}
          <button onClick={() => setGlobalError(null)}>&times;</button>
        </div>
      )}
      {globalSuccess && (
        <div className="global-success-toast">
          {globalSuccess}
          <button onClick={() => setGlobalSuccess(null)}>&times;</button>
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
