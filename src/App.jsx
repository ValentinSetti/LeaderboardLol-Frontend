import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import LeaderboardView from './pages/LeaderboardView';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard/:id" element={<LeaderboardView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;