import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Search, Filter, Plus } from 'lucide-react'
import { useEvents } from '../hooks/useEvents'
import { useEventContract } from '../hooks/useEventContract'
import { useWeb3 } from '../context/Web3Context'

const Events: React.FC = () => {
  const { events, loading, refetch } = useEvents()
  const { createEvent, contract } = useEventContract()
  const { isConnected, isCorrectNetwork } = useWeb3()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all')
  const [creatingTestEvent, setCreatingTestEvent] = useState(false)

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

  const createTestEvent = async () => {
    console.log('=== CREATE TEST EVENT START ===')
    console.log('Is connected:', isConnected)
    console.log('Is correct network:', isCorrectNetwork)
    
    if (!isConnected || !isCorrectNetwork) {
      alert('Please connect your wallet and switch to Hardhat Local network')
      return
    }

    try {
      setCreatingTestEvent(true)
      console.log('✅ Starting test event creation...')
      
      const startTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      const endTime = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours from now
      
      console.log('📅 Start time:', startTime)
      console.log('📅 End time:', endTime)
      
      const result = await createEvent(
        'Test Event',
        'This is a test event created for debugging',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500',
        startTime,
        endTime
      )
      
      console.log('✅ Test event created successfully:', result)
      alert('Test event created successfully!')
      refetch() // Refresh the events list
    } catch (error) {
      console.error('❌ Error creating test event:', error)
      alert('Failed to create test event: ' + (error as any).message)
    } finally {
      setCreatingTestEvent(false)
      console.log('=== CREATE TEST EVENT END ===')
    }
  }

  const testContract = async () => {
    console.log('=== TEST CONTRACT START ===')
    try {
      if (!contract) {
        console.log('❌ Contract not available')
        alert('Contract not available')
        return
      }
      
      console.log('✅ Contract available, testing...')
      const name = await contract.name()
      console.log('✅ Contract name:', name)
      alert(`Contract test successful! Name: ${name}`)
    } catch (error) {
      console.error('❌ Contract test failed:', error)
      alert('Contract test failed: ' + (error as any).message)
    }
    console.log('=== TEST CONTRACT END ===')
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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Explore blockchain-powered events with NFT tickets and exclusive rewards
          </p>
        </div>

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
          <h3 className="text-white font-semibold mb-2">Debug Information:</h3>
          <div className="text-purple-200 text-sm space-y-1">
            <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
            <div>Correct Network: {isCorrectNetwork ? 'Yes' : 'No'}</div>
            <div>Events Found: {events.length}</div>
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
          </div>
          <div className="mt-3 space-x-2">
            <button
              onClick={testContract}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Test Contract
            </button>
            <button
              onClick={createTestEvent}
              disabled={creatingTestEvent}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Plus className="h-4 w-4 inline mr-2" />
              <span>{creatingTestEvent ? 'Creating...' : 'Create Test Event'}</span>
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="pl-10 pr-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
            >
              <option value="all">All Events</option>
              <option value="upcoming">Upcoming</option>
              <option value="live">Live Now</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-purple-200">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No events have been created yet. Be the first to create an event!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.eventId} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="aspect-video bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mb-4 flex items-center justify-center">
                  <Calendar className="w-12 h-12 text-white" />
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold text-white">{event.name}</h3>
                  <p className="text-purple-200 text-sm line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-purple-200">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDate(event.startTime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>Blockchain Event</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      getEventStatus(event) === 'live' 
                        ? 'bg-green-500/20 text-green-300' 
                        : getEventStatus(event) === 'upcoming'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'bg-gray-500/20 text-gray-300'
                    }`}>
                      {getEventStatus(event).toUpperCase()}
                    </span>
                    
                    <Link
                      to={`/events/${event.eventId}`}
                      className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 text-sm font-medium"
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
    </div>
  )
}

export default Events
