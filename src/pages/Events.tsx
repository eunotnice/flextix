import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Star, Filter, Search } from 'lucide-react'

const Events = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Mock events data
  const events = [
    {
      id: 1,
      title: 'Tech Conference 2024',
      description: 'The biggest tech conference of the year featuring industry leaders and cutting-edge innovations.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      date: '2024-03-15',
      time: '09:00 AM',
      location: 'San Francisco, CA',
      organizer: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      attendees: 1250,
      category: 'technology',
      rating: 4.8,
      tiers: [
        { name: 'General', price: '0.1 ETH', available: 500 },
        { name: 'VIP', price: '0.3 ETH', available: 100 },
        { name: 'Premium', price: '0.5 ETH', available: 50 }
      ]
    },
    {
      id: 2,
      title: 'Music Festival Summer',
      description: 'Three days of amazing music with top artists from around the world.',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      date: '2024-06-20',
      time: '06:00 PM',
      location: 'Austin, TX',
      organizer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      attendees: 5000,
      category: 'music',
      rating: 4.9,
      tiers: [
        { name: 'GA', price: '0.2 ETH', available: 3000 },
        { name: 'VIP', price: '0.6 ETH', available: 500 },
        { name: 'Artist Pass', price: '1.0 ETH', available: 100 }
      ]
    },
    {
      id: 3,
      title: 'Art Gallery Opening',
      description: 'Exclusive opening of contemporary digital art exhibition.',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      date: '2024-02-28',
      time: '07:00 PM',
      location: 'New York, NY',
      organizer: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b7FAD',
      attendees: 200,
      category: 'art',
      rating: 4.7,
      tiers: [
        { name: 'Standard', price: '0.05 ETH', available: 150 },
        { name: 'Collector', price: '0.15 ETH', available: 50 }
      ]
    },
    {
      id: 4,
      title: 'Blockchain Summit',
      description: 'Learn about the latest developments in blockchain technology and DeFi.',
      image: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      date: '2024-04-10',
      time: '10:00 AM',
      location: 'Miami, FL',
      organizer: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
      attendees: 800,
      category: 'technology',
      rating: 4.6,
      tiers: [
        { name: 'Basic', price: '0.08 ETH', available: 600 },
        { name: 'Professional', price: '0.25 ETH', available: 200 }
      ]
    },
    {
      id: 5,
      title: 'Food & Wine Festival',
      description: 'Taste the finest cuisines and wines from renowned chefs and vintners.',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      date: '2024-05-18',
      time: '12:00 PM',
      location: 'Napa Valley, CA',
      organizer: '0xA0b86a33E6441e8e5c3F27d9C5c8e4c8e8e8e8e8',
      attendees: 300,
      category: 'food',
      rating: 4.8,
      tiers: [
        { name: 'Tasting', price: '0.12 ETH', available: 200 },
        { name: 'Premium', price: '0.35 ETH', available: 100 }
      ]
    },
    {
      id: 6,
      title: 'Gaming Convention',
      description: 'The ultimate gaming experience with tournaments, demos, and exclusive reveals.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
      date: '2024-07-12',
      time: '11:00 AM',
      location: 'Los Angeles, CA',
      organizer: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      attendees: 2500,
      category: 'gaming',
      rating: 4.9,
      tiers: [
        { name: 'General', price: '0.15 ETH', available: 2000 },
        { name: 'Pro Gamer', price: '0.4 ETH', available: 500 }
      ]
    }
  ]

  const categories = [
    { value: 'all', label: 'All Events' },
    { value: 'technology', label: 'Technology' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'gaming', label: 'Gaming' }
  ]

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Discover Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find amazing events and secure your NFT tickets on the blockchain
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search events, locations, or organizers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-gray-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-12 pr-8 py-3 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none cursor-pointer"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group block"
            >
              <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105">
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{event.rating}</span>
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-sm font-medium capitalize">
                    {event.category}
                  </div>
                </div>

                {/* Event Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Meta */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">{formatDate(event.date)} at {event.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.attendees.toLocaleString()} attendees</span>
                    </div>
                  </div>

                  {/* Ticket Tiers */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 mb-2">Available Tiers:</div>
                    {event.tiers.slice(0, 2).map((tier, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{tier.name}</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-purple-600">{tier.price}</span>
                          <span className="text-gray-500">({tier.available} left)</span>
                        </div>
                      </div>
                    ))}
                    {event.tiers.length > 2 && (
                      <div className="text-sm text-gray-500">
                        +{event.tiers.length - 2} more tier{event.tiers.length - 2 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Organizer */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <div className="text-xs text-gray-500">
                      Organizer: {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No events found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find more events.
            </p>
            <Link
              to="/create-event"
              className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Calendar className="h-5 w-5" />
              <span>Create Your Own Event</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Events
