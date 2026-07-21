import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext.jsx';
import ConnectionBanner from './components/Common/ConnectionBanner.jsx';
import LobbyPage from './pages/LobbyPage.jsx';
import HostDashboard from './pages/HostDashboard.jsx';
import GamePage from './pages/GamePage.jsx';
import ProjectionDisplay from './components/Displays/ProjectionDisplay.jsx';
import RulesOverview from './pages/RulesOverview.jsx';
import TestLab from './pages/TestLab.jsx';
import SecretTestLabLauncher from './components/Common/SecretTestLabLauncher.jsx';
import MenuExitButton from './components/Common/MenuExitButton.jsx';

export default function App() {
  return (
    <GameProvider>
      <ConnectionBanner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LobbyPage />} />
          <Route path="/host" element={<HostDashboard />} />
          <Route path="/rules" element={<GamePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/projection" element={<ProjectionDisplay />} />
          <Route path="/regles" element={<RulesOverview />} />
          <Route path="/test-lab" element={<TestLab />} />
        </Routes>
        <MenuExitButton />
        <SecretTestLabLauncher />
      </BrowserRouter>
    </GameProvider>
  );
}
