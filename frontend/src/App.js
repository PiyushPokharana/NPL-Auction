import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuctionProvider, useAuction } from './context/AuctionContext';
import LandingPage from './pages/LandingPage';
import AuctioneerPanel from './pages/AuctioneerPanel';
import TeamManagerPanel from './pages/TeamManagerPanel';
import Header from './components/Header';
import './index.css';

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
  return (
    <div className="app">
      <Header />
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
