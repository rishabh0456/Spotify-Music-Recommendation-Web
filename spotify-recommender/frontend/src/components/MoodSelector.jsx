import { useState } from 'react'

const MOODS = [
  {
    id:          'happy',
    emoji:       '😊',
    label:       'Happy',
    color:       'from-yellow-500 to-orange-400',
    border:      'border-yellow-500',
    bg:          'bg-yellow-500',
    description: 'Upbeat & joyful vibes'
  },
  {
    id:          'sad',
    emoji:       '😢',
    label:       'Sad',
    color:       'from-blue-600 to-blue-400',
    border:      'border-blue-500',
    bg:          'bg-blue-500',
    description: 'Emotional & melancholic'
  },
  {
    id:          'energetic',
    emoji:       '⚡',
    label:       'Energetic',
    color:       'from-red-500 to-pink-500',
    border:      'border-red-500',
    bg:          'bg-red-500',
    description: 'High energy & intense'
  },
  {
    id:          'chill',
    emoji:       '😌',
    label:       'Chill',
    color:       'from-teal-500 to-cyan-400',
    border:      'border-teal-500',
    bg:          'bg-teal-500',
    description: 'Relaxed & laid-back'
  },
  {
    id:          'romantic',
    emoji:       '❤️',
    label:       'Romantic',
    color:       'from-pink-500 to-rose-400',
    border:      'border-pink-500',
    bg:          'bg-pink-500',
    description: 'Love & tender moments'
  },
  {
    id:          'angry',
    emoji:       '😤',
    label:       'Angry',
    color:       'from-red-700 to-red-500',
    border:      'border-red-700',
    bg:          'bg-red-700',
    description: 'Intense & aggressive'
  },
  {
    id:          'focused',
    emoji:       '🎯',
    label:       'Focused',
    color:       'from-purple-600 to-indigo-500',
    border:      'border-purple-500',
    bg:          'bg-purple-500',
    description: 'Study & deep work'
  },
  {
    id:          'party',
    emoji:       '🎉',
    label:       'Party',
    color:       'from-green-500 to-emerald-400',
    border:      'border-green-500',
    bg:          'bg-green-500',
    description: 'Dance & celebrate'
  },
]

export default function MoodSelector({ onMoodSelect, loading }) {
  const [selectedMood, setSelectedMood] = useState(null)

  const handleMoodClick = (mood) => {
    setSelectedMood(mood.id)
    onMoodSelect(mood.id)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-gray-400 text-sm uppercase tracking-widest mb-2">
          Or discover by mood
        </p>
        <div className="w-16 h-px bg-gray-700 mx-auto" />
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodClick(mood)}
            disabled={loading}
            className={`
              group relative flex flex-col items-center gap-2 p-3
              rounded-xl border transition-all duration-300
              ${selectedMood === mood.id
                ? `${mood.border} bg-white bg-opacity-10 scale-105`
                : 'border-gray-700 hover:border-gray-500 bg-white bg-opacity-5 hover:bg-opacity-10'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {/* Glow effect on selected */}
            {selectedMood === mood.id && (
              <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${mood.color} opacity-10`} />
            )}

            <span className="text-2xl">{mood.emoji}</span>
            <span className={`text-xs font-semibold ${
              selectedMood === mood.id ? 'text-white' : 'text-gray-400'
            }`}>
              {mood.label}
            </span>

            {/* Loading spinner on selected */}
            {selectedMood === mood.id && loading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black bg-opacity-50">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}