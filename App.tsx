
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import HostPage from './pages/HostPage';
import JoinPage from './pages/JoinPage';
import PlayerPage from './pages/PlayerPage';
import Header from './components/Header';
import RulesPage from './pages/RulesPage';
import FAQPage from './pages/FAQPage';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/host" element={<HostPage />} />
            <Route path="/host/:gameId" element={<HostPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/player/:gameId" element={<PlayerPage />} />
            <Route path="/rules" element={<RulesPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;