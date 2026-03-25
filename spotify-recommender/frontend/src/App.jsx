import { Routes, Route } from 'react-router-dom'
import { PlayerProvider } from './context/PlayerContext'
import Navbar from './components/Navbar'
import MusicPlayer from './components/MusicPlayer'
import Home from './pages/Home'
import Results from './pages/Results'

export default function App() {
  return (
    <PlayerProvider>
      <div className="min-h-screen bg-[#121212]">
        <Navbar />
        <Routes>
          <Route path="/"        element={<Home />} />
          <Route path="/results" element={<Results />} />
        </Routes>
        <MusicPlayer />
      </div>
    </PlayerProvider>
  )
}