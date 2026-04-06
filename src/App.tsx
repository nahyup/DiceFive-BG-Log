import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GameCollection from './pages/GameCollection';
import PlayLog from './pages/PlayLog';
import Statistics from './pages/Statistics';
import PlayerManagement from './pages/PlayerManagement';
import GameRecommend from './pages/GameRecommend';
import { useBoardGameStore } from './store/useBoardGameStore';

function App() {
  const hasHydrated = useBoardGameStore(state => state._hasHydrated);

  if (!hasHydrated) return null;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="collection" element={<GameCollection />} />
          <Route path="players" element={<PlayerManagement />} />
          <Route path="play-log" element={<PlayLog />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="recommend" element={<GameRecommend />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
