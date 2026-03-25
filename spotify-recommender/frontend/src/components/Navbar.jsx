import { Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-95 backdrop-blur-sm border-b border-white border-opacity-10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <Music2 size={18} className="text-black" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            Spotify<span className="text-green-500">AI</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-white text-sm font-medium transition-colors"
          >
            Home
          </Link>
          
          <a
            href="https://open.spotify.com" 
            target="_blank"
            rel="noreferrer"
            className="bg-green-500 hover:bg-green-400 text-black text-sm font-bold px-5 py-2 rounded-full transition-colors"
          >
            Open Spotify
          </a>
        </div>
      </div>
    </nav>
  )
}