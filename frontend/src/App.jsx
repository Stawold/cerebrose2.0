import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import GamePage from './pages/GamePage.jsx';
import ProjectionDisplay from './components/Displays/ProjectionDisplay.jsx';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/rules" element={<GamePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/projection" element={<ProjectionDisplay />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}
