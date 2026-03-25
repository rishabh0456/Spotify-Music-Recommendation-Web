import { useState } from 'react'
import { Search, X } from 'lucide-react'

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim().length < 2) return
    onSearch(query.trim())
  }

  const clearQuery = () => setQuery('')

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <Search
          size={20}
          className="absolute left-4 text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for a song or artist..."
          className="w-full bg-white bg-opacity-10 hover:bg-opacity-15 focus:bg-opacity-20 text-white placeholder-gray-400 rounded-full pl-12 pr-24 py-4 text-base outline-none border border-transparent focus:border-green-500 transition-all"
          disabled={loading}
        />
        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="absolute right-20 text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="absolute right-2 bg-green-500 hover:bg-green-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-bold px-5 py-2 rounded-full text-sm transition-colors"
        >
          {loading ? '...' : 'Search'}
        </button>
      </div>
    </form>
  )
}