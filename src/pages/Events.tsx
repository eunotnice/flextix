import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Search, Filter, Image } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'

const Events: React.FC = () => {
  const { events, loading, refetch } = useEvents()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all')
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = (event: any) => {
    const now = Math.floor(Date.now() / 1000)
    if (event.hasEnded) return 'ended'
    if (now >= event.startTime && now <= event.endTime) return 'live'
    if (now < event.startTime) return 'upcoming'
    return 'ended'
  }

  const handleImageError = (eventId: string) => {
    setImageErrors(prev => new Set(prev).add(eventId))
  }

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    
    const status = getEventStatus(event)
    return matchesSearch && status === filterStatus
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500/20"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto opacity-90">
            Explore blockchain-powered events with NFT tickets and exclusive rewards
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 animate-slide-up">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5 group-focus-within:text-purple-200 transition-colors duration-200" />
            <input
              type="text"
              placeholder="Search events by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white/15 backdrop-blur-lg border-2 border-white/30 rounded-2xl text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-white/40 transition-all duration-300 shadow-lg"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          </div>
          
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5 group-focus-within:text-purple-200 transition-colors duration-200" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-12 pr-10 py-4 bg-white/15 backdrop-blur-lg border-2 border-white/30 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 hover:border-white/40 transition-all duration-300 appearance-none cursor-pointer shadow-lg min-w-[160px]"
            >
              <option value="all" className="bg-gray-800">All Events</option>
              <option value="upcoming" className="bg-gray-800">Upcoming</option>
              <option value="live" className="bg-gray-800">Live Now</option>
              <option value="ended" className="bg-gray-800">Ended</option>
            </select>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-12 max-w-md mx-auto border-2 border-white/20 shadow-2xl">
              <div className="relative mb-6">
                <Calendar className="w-20 h-20 text-purple-300 mx-auto animate-bounce" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">No Events Found</h3>
              <p className="text-purple-200 leading-relaxed">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find more events'
                  : 'No events have been created yet. Be the first to create an amazing event!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map((event, index) => (
              <div 
                key={event.eventId} 
                className="group bg-white/10 backdrop-blur-xl rounded-3xl p-6 border-2 border-white/30 hover:border-white/50 hover:bg-white/15 transition-all duration-500 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Event Image */}
                <div className="aspect-video rounded-2xl mb-6 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 relative group-hover:shadow-lg transition-shadow duration-300">
                  {event.imageUri && !imageErrors.has(event.eventId.toString()) ? (
                    <img
                      src={event.imageUri}
                      alt={event.name}
                      onError={() => handleImageError(event.eventId.toString())}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600">
                      <div className="text-center">
                        <Image className="w-16 h-16 text-white/80 mx-auto mb-2" />
                        <p className="text-white/60 text-sm">Event Image</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300 line-clamp-2">
                    {event.name}
                  </h3>
                  <p className="text-purple-200/80 text-sm leading-relaxed line-clamp-3 group-hover:text-purple-100 transition-colors duration-300">
                    {event.description}
                  </p>
                  
                  <div className="space-y-3 text-sm text-purple-200/70">
                    <div className="flex items-center space-x-3 group-hover:text-purple-100 transition-colors duration-300">
                      <Clock className="w-5 h-5 text-purple-300" />
                      <span className="font-medium">{formatDate(event.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-3 group-hover:text-purple-100 transition-colors duration-300">
                      <MapPin className="w-5 h-5 text-purple-300" />
                      <span>Blockchain Event</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      getEventStatus(event) === 'live' 
                        ? 'bg-green-500/20 text-green-300 border-green-500/50 shadow-green-500/20' 
                        : getEventStatus(event) === 'upcoming'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-blue-500/20'
                        : 'bg-gray-500/20 text-gray-300 border-gray-500/50 shadow-gray-500/20'
                    } shadow-lg`}>
                      {getEventStatus(event)}
                    </span>
                    
                    <Link
                      to={`/events/${event.eventId}`}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 border border-white/20"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
          opacity: 0;
          animation-fill-mode: forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}

export default Events