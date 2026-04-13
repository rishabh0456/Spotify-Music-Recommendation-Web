import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Music2, Sparkles, Zap, Brain, Users, ArrowRight,
  CheckCircle, Star, Play, Github, Twitter, Linkedin,
  BarChart3, Headphones, Wand2, TrendingUp
} from 'lucide-react'

export default function Landing() {
  const [scrollY, setScrollY] = useState(0)
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ───────────────────────────────────────────────────────────
  // ── FEATURES DATA ───────────────────────────────────────────
  // ───────────────────────────────────────────────────────────
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Intelligence',
      description: 'Machine learning analyzes 81,000+ tracks to understand musical DNA and find your perfect match.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Sparkles,
      title: 'Instant Discovery',
      description: 'Get personalized recommendations in milliseconds using advanced cosine similarity algorithms.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Music2,
      title: 'Mood-Based Vibes',
      description: 'Search by mood, energy, or vibe. Whether happy, energetic, or chill – we have the perfect playlist.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: BarChart3,
      title: 'Audio Feature Analysis',
      description: 'Analyzes danceability, energy, valence, acousticness, and more to match your taste perfectly.',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const stats = [
    { number: '81K+', label: 'Tracks Analyzed', icon: Music2 },
    { number: '9', label: 'Audio Features', icon: Wand2 },
    { number: 'Instant', label: 'Recommendations', icon: Zap },
    { number: '100%', label: 'Free to Use', icon: HeartIcon },
  ]

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Music Producer',
      avatar: '👩‍🎤',
      content: 'Finally found a tool that understands my musical taste. The recommendations are incredibly accurate!',
      rating: 5
    },
    {
      name: 'Alex Chen',
      role: 'DJ & Music Enthusiast',
      avatar: '👨‍🎵',
      content: 'Best discovery tool I\'ve used. It introduced me to artists I wouldn\'t have found otherwise.',
      rating: 5
    },
    {
      name: 'Emma Rodriguez',
      role: 'Content Creator',
      avatar: '👩‍💼',
      content: 'The mood-based search feature is a game-changer for creating perfect playlists for my videos.',
      rating: 5
    }
  ]

  const faqs = [
    {
      q: 'How does SpotifyAI find recommendations?',
      a: 'We use advanced machine learning with cosine similarity algorithms analyzing 9 key audio features (danceability, energy, valence, etc.) from our dataset of 81,000+ tracks.'
    },
    {
      q: 'Is it really free?',
      a: 'Yes! Our service is completely free. But if you love music, support artists on Spotify, Apple Music, or YouTube Music.'
    },
    {
      q: 'Can I refine my recommendations?',
      a: 'Absolutely! You can use our AI prompt feature to customize recommendations based on specific moods or styles you\'re looking for.'
    },
    {
      q: 'How accurate are the recommendations?',
      a: 'Our algorithm considers multiple audio features to find similarities. The more specific your search, the better the results.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white overflow-hidden">
      
      {/* ─── HERO SECTION ──────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
        
        {/* Animated background gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-500 opacity-10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Floating background shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 border border-green-500 rounded-3xl opacity-20 animate-float" />
        <div className="absolute bottom-32 right-20 w-32 h-32 border-2 border-purple-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 text-green-400 text-sm px-4 py-2 rounded-full mb-6 hover:bg-green-500/20 transition-colors">
            <Sparkles size={14} />
            Powered by AI & Machine Learning
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-7xl font-black mb-6 leading-tight">
            Discover Music
            <br />
            <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Your Way
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto font-light">
            AI-powered recommendations that understand your taste. Search, discover, and explore 81,000+ tracks in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              to="/app"
              className="group relative px-8 py-4 rounded-full bg-green-500 text-black font-bold text-lg hover:bg-green-400 transition-all hover:scale-105 flex items-center gap-2 shadow-lg shadow-green-500/50"
            >
              Start Exploring
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Stats preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="text-3xl font-bold text-green-400 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ──────────────────────────────────── */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4">How SpotifyAI Works</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Cutting-edge technology meets music discovery. Here's what makes us different.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.01] border border-white/10 hover:border-green-500/50 transition-all hover:shadow-2xl hover:shadow-green-500/20 cursor-pointer"
              onClick={() => setActiveFeature(i)}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
              
              {/* Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon size={24} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-3 group-hover:text-green-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>

              {/* Arrow decoration */}
              <ArrowRight className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all text-green-400" size={20} />
            </div>
          ))}
        </div>

        {/* Process Flow */}
        <div className="mt-20 p-12 rounded-3xl bg-gradient-to-r from-green-500/5 to-purple-500/5 border border-white/10">
          <h3 className="text-2xl font-bold mb-12 text-center">The Search Process</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {[
              { step: 1, title: 'Search', icon: Music2 },
              { step: 2, title: 'Analyze', icon: Brain },
              { step: 3, title: 'Match', icon: Sparkles },
              { step: 4, title: 'Enrich', icon: BarChart3 },
              { step: 5, title: 'Deliver', icon: TrendingUp }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-xl border-4 border-green-500/20">
                  {item.step}
                </div>
                <p className="text-center text-sm font-semibold text-gray-300">{item.title}</p>
                {i < 4 && <ArrowRight className="text-green-500 hidden md:block -ml-2" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SHOWCASE ─────────────────────────────────── */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">Packed with Features</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Wand2,
              title: 'Smart Search',
              description: 'Find any track from our massive database instantly with fuzzy matching.'
            },
            {
              icon: Headphones,
              title: 'Mood-Based Discovery',
              description: 'Select a vibe and get recommendations tailored to your current mood.'
            },
            {
              icon: Zap,
              title: 'Lightning Fast',
              description: 'Get results in milliseconds using optimized ML algorithms.'
            },
            {
              icon: Users,
              title: 'Community Driven',
              description: 'Built on public datasets and open-source technology everyone can trust.'
            },
            {
              icon: TrendingUp,
              title: 'Audio Analytics',
              description: 'Deep insights into danceability, energy, valence, and more.'
            },
            {
              icon: Music2,
              title: '81K+ Tracks',
              description: 'Access our curated collection spanning every genre and era.'
            }
          ].map((item, i) => (
            <div
              key={i}
              className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 hover:bg-white/[0.08] transition-all hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20"
            >
              <item.icon className="w-10 h-10 text-green-400 mb-4 group-hover:scale-125 transition-transform" />
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS SECTION ──────────────────────────────── */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">Loved by Music Enthusiasts</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <div
              key={i}
              className="p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-green-500/50 transition-all hover:shadow-2xl hover:shadow-green-500/10"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-300 mb-6 italic">{testimonial.content}</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-xl">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FAQ SECTION ───────────────────────────────────────── */}
      <section className="relative py-20 px-6 max-w-3xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black mb-16 text-center">Frequently Asked Questions</h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-green-500/50 cursor-pointer transition-all hover:bg-white/[0.08]"
            >
              <summary className="flex items-center justify-between font-bold text-lg cursor-pointer select-none">
                {faq.q}
                <span className="text-green-400 group-open:rotate-180 transition-transform">+</span>
              </summary>
              <p className="text-gray-400 mt-4 leading-relaxed">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ─── CTA SECTION ───────────────────────────────────────── */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-6">Ready to Discover?</h2>
          <p className="text-2xl text-gray-400 mb-12">
            Start exploring personalized music recommendations right now.
          </p>
          <Link
            to="/app"
            className="group inline-block px-10 py-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold text-xl hover:shadow-2xl hover:shadow-green-500/50 hover:scale-105 transition-all"
          >
            Get Started Free
            <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={24} />
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="relative border-t border-white/10 py-16 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          
          {/* Top section */}
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Music2 className="w-6 h-6 text-green-500" />
                <span className="font-bold text-lg">SpotifyAI</span>
              </Link>
              <p className="text-gray-400 text-sm">AI-powered music recommendations for everyone.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">Features</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Docs</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-400 transition">About</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Blog</a></li>
                <li><a href="#" className="hover:text-green-400 transition">Contact</a></li>
              </ul>
            </div>

            {/* Social */}
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex gap-4">
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-green-500 hover:text-black transition-colors flex items-center justify-center">
                  <Github size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-green-500 hover:text-black transition-colors flex items-center justify-center">
                  <Twitter size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-white/10 hover:bg-green-500 hover:text-black transition-colors flex items-center justify-center">
                  <Linkedin size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white/10 my-12" />

          {/* Bottom section */}
          <div className="flex flex-col md:flex-row items-center justify-between text-gray-400 text-sm">
            <p>&copy; 2026 SpotifyAI. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
              <a href="#" className="hover:text-white transition">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper component for missing icon
function HeartIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}
