import React, { useState } from 'react'
import { User, Ticket, Trophy, Star, Eye, EyeOff, Share2, Download, Grid, List, Plus, Calendar, MapPin, DollarSign, Save, Trash2, Edit, BarChart3, Users, Clock } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

interface NFTTicket {
  id: number
  tokenId: number
  eventTitle: string
  eventImage: string
  tierName: string
  date: string
  location: string
  price: string
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  isDisplayed: boolean
  attributes: {
    artist?: string
    venue: string
    category: string
    year: string
  }
}

interface CreatedEvent {
  id: number
  eventId: number
  name: string
  description: string
  imageUri: string
  startDate: string
  endDate: string
  location: string
  category: string
  status: 'upcoming' | 'ongoing' | 'ended'
  totalTicketsSold: number
  totalRevenue: string
  attendees: number
  tiers: {
    name: string
    price: string
    sold: number
    total: number
  }[]
}

interface TicketTier {
  name: string
  price: string
  maxSupply: string
  maxPerWallet: string
  description: string
}

const Profile = () => {
  const { isConnected, account, connectWallet } = useWeb3()
  const [activeTab, setActiveTab] = useState<'collection' | 'created-events' | 'create-event'>('collection')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterRarity, setFilterRarity] = useState<string>('all')
  const [showOnlyDisplayed, setShowOnlyDisplayed] = useState(false)
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)

  // Event creation state
  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    imageUri: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    category: 'technology',
    website: ''
  })

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>([
    {
      name: 'General Admission',
      price: '0.1',
      maxSupply: '1000',
      maxPerWallet: '5',
      description: 'Standard access to the event'
    }
  ])

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'music', label: 'Music' },
    { value: 'art', label: 'Art' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'business', label: 'Business' },
    { value: 'education', label: 'Education' },
    { value: 'sports', label: 'Sports' },
    { value: 'other', label: 'Other' }
  ]

  // Mock created events data
  const [createdEvents, setCreatedEvents] = useState<CreatedEvent[]>([
    {
      id: 1,
      eventId: 1001,
      name: 'Tech Conference 2024',
      description: 'Annual technology conference featuring the latest innovations in AI, blockchain, and web development.',
      imageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      startDate: '2024-03-15',
      endDate: '2024-03-17',
      location: 'San Francisco, CA',
      category: 'Technology',
      status: 'upcoming',
      totalTicketsSold: 450,
      totalRevenue: '67.5',
      attendees: 0,
      tiers: [
        { name: 'General Admission', price: '0.1', sold: 300, total: 500 },
        { name: 'VIP Pass', price: '0.3', sold: 150, total: 200 }
      ]
    },
    {
      id: 2,
      eventId: 1002,
      name: 'Blockchain Summit',
      description: 'Exploring the future of decentralized finance and Web3 technologies.',
      imageUri: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      startDate: '2024-02-28',
      endDate: '2024-02-28',
      location: 'Miami, FL',
      category: 'Blockchain',
      status: 'ended',
      totalTicketsSold: 280,
      totalRevenue: '42.0',
      attendees: 265,
      tiers: [
        { name: 'Standard', price: '0.15', sold: 280, total: 300 }
      ]
    },
    {
      id: 3,
      eventId: 1003,
      name: 'AI Workshop Series',
      description: 'Hands-on workshops covering machine learning, neural networks, and practical AI applications.',
      imageUri: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      startDate: '2024-01-20',
      endDate: '2024-01-22',
      location: 'Virtual Event',
      category: 'Education',
      status: 'ongoing',
      totalTicketsSold: 150,
      totalRevenue: '22.5',
      attendees: 142,
      tiers: [
        { name: 'Workshop Access', price: '0.15', sold: 150, total: 200 }
      ]
    }
  ])

  // Mock NFT tickets data
  const [nftTickets, setNftTickets] = useState<NFTTicket[]>([
    {
      id: 1,
      tokenId: 12345,
      eventTitle: 'Tech Conference 2024',
      eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'VIP Pass',
      date: '2024-03-15',
      location: 'San Francisco, CA',
      price: '0.3 ETH',
      rarity: 'Epic',
      isDisplayed: true,
      attributes: {
        venue: 'Moscone Center',
        category: 'Technology',
        year: '2024'
      }
    },
    {
      id: 2,
      tokenId: 12346,
      eventTitle: 'Music Festival Summer',
      eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'General Admission',
      date: '2024-06-20',
      location: 'Austin, TX',
      price: '0.2 ETH',
      rarity: 'Common',
      isDisplayed: true,
      attributes: {
        artist: 'Various Artists',
        venue: 'Zilker Park',
        category: 'Music',
        year: '2024'
      }
    },
    {
      id: 3,
      tokenId: 12347,
      eventTitle: 'Art Gallery Opening',
      eventImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Collector Pass',
      date: '2024-01-15',
      location: 'New York, NY',
      price: '0.15 ETH',
      rarity: 'Rare',
      isDisplayed: false,
      attributes: {
        venue: 'MoMA',
        category: 'Art',
        year: '2024'
      }
    },
    {
      id: 4,
      tokenId: 12348,
      eventTitle: 'Blockchain Summit',
      eventImage: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Premium Access',
      date: '2024-02-28',
      location: 'Miami, FL',
      price: '0.25 ETH',
      rarity: 'Legendary',
      isDisplayed: true,
      attributes: {
        venue: 'Miami Convention Center',
        category: 'Blockchain',
        year: '2024'
      }
    },
    {
      id: 5,
      tokenId: 12349,
      eventTitle: 'Fashion Week Gala',
      eventImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Front Row',
      date: '2024-04-10',
      location: 'Paris, France',
      price: '0.8 ETH',
      rarity: 'Legendary',
      isDisplayed: true,
      attributes: {
        venue: 'Grand Palais',
        category: 'Fashion',
        year: '2024'
      }
    }
  ])

  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'Common':
        return {
          borderClass: 'border-2 border-gray-300',
          gradientBorder: '',
          shadow: 'shadow-lg',
          badge: 'text-gray-700 bg-gray-100 border-gray-300',
          animation: ''
        }
      case 'Rare':
        return {
          borderClass: '',
          gradientBorder: 'bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-600 p-[3px]',
          shadow: 'shadow-xl shadow-blue-200/50',
          badge: 'text-blue-700 bg-blue-100 border-blue-400',
          animation: 'animate-pulse'
        }
      case 'Epic':
        return {
          borderClass: '',
          gradientBorder: 'bg-gradient-to-r from-purple-500 via-pink-500 to-purple-700 p-[4px]',
          shadow: 'shadow-2xl shadow-purple-300/60',
          badge: 'text-purple-700 bg-purple-100 border-purple-500',
          animation: 'animate-pulse'
        }
      case 'Legendary':
        return {
          borderClass: '',
          gradientBorder: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-500 p-[4px]',
          shadow: 'shadow-2xl shadow-amber-300/70',
          badge: 'text-amber-800 bg-amber-100 border-amber-500',
          animation: 'animate-pulse'
        }
      default:
        return {
          borderClass: 'border-2 border-gray-300',
          gradientBorder: '',
          shadow: 'shadow-lg',
          badge: 'text-gray-700 bg-gray-100 border-gray-300',
          animation: ''
        }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'text-blue-600 bg-blue-100 border-blue-300'
      case 'ongoing': return 'text-green-600 bg-green-100 border-green-300'
      case 'ended': return 'text-gray-600 bg-gray-100 border-gray-300'
      default: return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const toggleDisplayStatus = (ticketId: number) => {
    setNftTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, isDisplayed: !ticket.isDisplayed }
        : ticket
    ))
  }

  const filteredTickets = nftTickets.filter(ticket => {
    if (filterRarity !== 'all' && ticket.rarity !== filterRarity) return false
    if (showOnlyDisplayed && !ticket.isDisplayed) return false
    return true
  })

  const filteredEvents = createdEvents.filter(event => {
    if (eventFilter !== 'all' && event.status !== eventFilter) return false
    return true
  })

  const displayedTickets = nftTickets.filter(ticket => ticket.isDisplayed)
  const totalValue = nftTickets.reduce((sum, ticket) => sum + parseFloat(ticket.price.replace(' ETH', '')), 0)
  const totalEventsCreated = createdEvents.length
  const totalRevenue = createdEvents.reduce((sum, event) => sum + parseFloat(event.totalRevenue), 0)
  const totalTicketsSold = createdEvents.reduce((sum, event) => sum + event.totalTicketsSold, 0)

  // Event creation functions
  const handleEventDataChange = (field: string, value: string) => {
    setEventData(prev => ({ ...prev, [field]: value }))
  }

  const handleTierChange = (index: number, field: string, value: string) => {
    setTicketTiers(prev => prev.map((tier, i) => 
      i === index ? { ...tier, [field]: value } : tier
    ))
  }

  const addTier = () => {
    setTicketTiers(prev => [...prev, {
      name: '',
      price: '0.1',
      maxSupply: '100',
      maxPerWallet: '2',
      description: ''
    }])
  }

  const removeTier = (index: number) => {
    if (ticketTiers.length > 1) {
      setTicketTiers(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      await connectWallet()
      return
    }

    // Validation
    if (!eventData.name || !eventData.description || !eventData.startDate || !eventData.startTime) {
      toast.error('Please fill in all required fields')
      return
    }

    if (ticketTiers.some(tier => !tier.name || !tier.price || !tier.maxSupply)) {
      toast.error('Please complete all ticket tier information')
      return
    }

    setIsCreatingEvent(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      toast.success('Event created successfully!')
      
      // Reset form
      setEventData({
        name: '',
        description: '',
        imageUri: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        location: '',
        category: 'technology',
        website: ''
      })
      setTicketTiers([{
        name: 'General Admission',
        price: '0.1',
        maxSupply: '1000',
        maxPerWallet: '5',
        description: 'Standard access to the event'
      }])
      
      // Switch to created events tab
      setActiveTab('created-events')
      
    } catch (error) {
      toast.error('Failed to create event. Please try again.')
    } finally {
      setIsCreatingEvent(false)
    }
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50">
          <User className="w-20 h-20 text-purple-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view your profile</p>
          <button
            onClick={connectWallet}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-white">
                <User className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  My Profile
                </h1>
                <p className="text-gray-600 text-lg mt-2">{account?.slice(0, 6)}...{account?.slice(-4)}</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Share2 className="w-5 h-5" />
                <span>Share Profile</span>
              </button>
              <button className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <Ticket className="w-10 h-10 text-purple-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900">{nftTickets.length}</h3>
              <p className="text-gray-600 font-medium">NFT Tickets</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
              <Eye className="w-10 h-10 text-green-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900">{displayedTickets.length}</h3>
              <p className="text-gray-600 font-medium">Displayed</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100">
              <Star className="w-10 h-10 text-orange-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900">{totalValue.toFixed(2)} ETH</h3>
              <p className="text-gray-600 font-medium">Portfolio Value</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <Calendar className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900">{totalEventsCreated}</h3>
              <p className="text-gray-600 font-medium">Events Created</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100">
              <Users className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900">{totalTicketsSold}</h3>
              <p className="text-gray-600 font-medium">Tickets Sold</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100">
              <Trophy className="w-10 h-10 text-yellow-600 mx-auto mb-3" />
              <h3 className="text-3xl font-bold text-gray-900">{totalRevenue.toFixed(1)} ETH</h3>
              <p className="text-gray-600 font-medium">Total Revenue</p>
            </div>
          </div>
        </div>

        {/* Enhanced Tab Navigation */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
          <div className="flex space-x-2 bg-gradient-to-r from-gray-100 to-gray-200 p-2 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('collection')}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                activeTab === 'collection'
                  ? 'bg-white text-purple-600 shadow-lg scale-105 ring-2 ring-purple-200'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Ticket className="w-6 h-6" />
              <span className="text-lg">My Collection</span>
            </button>
            <button
              onClick={() => setActiveTab('created-events')}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                activeTab === 'created-events'
                  ? 'bg-white text-purple-600 shadow-lg scale-105 ring-2 ring-purple-200'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-lg">My Events</span>
            </button>
            <button
              onClick={() => setActiveTab('create-event')}
              className={`flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform ${
                activeTab === 'create-event'
                  ? 'bg-white text-purple-600 shadow-lg scale-105 ring-2 ring-purple-200'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
              }`}
            >
              <Plus className="w-6 h-6" />
              <span className="text-lg">Create Event</span>
            </button>
          </div>
        </div>

        {/* Collection Tab */}
        {activeTab === 'collection' && (
          <>
            {/* Enhanced Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <select
                    value={filterRarity}
                    onChange={(e) => setFilterRarity(e.target.value)}
                    className="px-6 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm font-medium text-lg transition-all duration-300"
                  >
                    <option value="all">All Rarities</option>
                    <option value="Common">Common</option>
                    <option value="Rare">Rare</option>
                    <option value="Epic">Epic</option>
                    <option value="Legendary">Legendary</option>
                  </select>
                  
                  <label className="flex items-center space-x-3 p-3 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-200">
                    <input
                      type="checkbox"
                      checked={showOnlyDisplayed}
                      onChange={(e) => setShowOnlyDisplayed(e.target.checked)}
                      className="rounded-lg border-gray-300 text-purple-600 focus:ring-purple-500 w-5 h-5"
                    />
                    <span className="text-gray-700 font-medium">Show only displayed</span>
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-2 ring-purple-300' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Grid className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-2 ring-purple-300' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <List className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced NFT Collection */}
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
                  <Ticket className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No NFTs found</h3>
                  <p className="text-gray-600 text-lg">Try adjusting your filters or purchase some event tickets.</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                {filteredTickets.map((ticket) => {
                  const rarityStyles = getRarityStyles(ticket.rarity)
                  
                  return (
                    <div key={ticket.id} className={`${rarityStyles.animation}`}>
                      {/* Gradient Border Wrapper for Rare+ NFTs */}
                      {rarityStyles.gradientBorder ? (
                        <div className={`rounded-3xl ${rarityStyles.gradientBorder} ${rarityStyles.shadow} hover:shadow-2xl transition-all duration-500 transform hover:scale-105`}>
                          <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden h-full">
                            {viewMode === 'grid' ? (
                              <>
                                <div className="relative">
                                  <img 
                                    src={ticket.eventImage} 
                                    alt={ticket.eventTitle}
                                    className="w-full h-56 object-cover"
                                  />
                                  <div className={`absolute top-4 right-4 px-3 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-sm bg-white/80 ${rarityStyles.badge}`}>
                                    ✨ {ticket.rarity}
                                  </div>
                                  <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                                    #{ticket.tokenId}
                                  </div>
                                  <button
                                    onClick={() => toggleDisplayStatus(ticket.id)}
                                    className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                                      ticket.isDisplayed 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-300' 
                                        : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white ring-2 ring-gray-300'
                                    }`}
                                  >
                                    {ticket.isDisplayed ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                  </button>
                                </div>
                                
                                <div className="p-8">
                                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{ticket.eventTitle}</h3>
                                  <p className="text-purple-600 font-bold text-lg mb-3">{ticket.tierName}</p>
                                  <p className="text-gray-600 mb-6 flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {ticket.date} • {ticket.location}
                                  </p>
                                  
                                  <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 font-medium">Venue:</span>
                                      <span className="text-gray-900 font-semibold">{ticket.attributes.venue}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 font-medium">Category:</span>
                                      <span className="text-gray-900 font-semibold">{ticket.attributes.category}</span>
                                    </div>
                                    {ticket.attributes.artist && (
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 font-medium">Artist:</span>
                                        <span className="text-gray-900 font-semibold">{ticket.attributes.artist}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                      {ticket.price}
                                    </span>
                                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                      ticket.isDisplayed 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 ring-1 ring-green-300' 
                                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300'
                                    }`}>
                                      {ticket.isDisplayed ? '👁️ Displayed' : '🙈 Hidden'}
                                    </span>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="flex items-center p-8 space-x-6">
                                <div className="relative">
                                  <img 
                                    src={ticket.eventImage} 
                                    alt={ticket.eventTitle}
                                    className="w-24 h-24 object-cover rounded-2xl"
                                  />
                                  <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rarityStyles.badge}`}>
                                    ✨
                                  </div>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{ticket.eventTitle}</h3>
                                    <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${rarityStyles.badge}`}>
                                      {ticket.rarity}
                                    </span>
                                  </div>
                                  <p className="text-purple-600 font-bold mb-2">{ticket.tierName}</p>
                                  <p className="text-gray-600">{ticket.date} • {ticket.location}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                                    {ticket.price}
                                  </p>
                                  <button
                                    onClick={() => toggleDisplayStatus(ticket.id)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                                      ticket.isDisplayed 
                                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 ring-1 ring-green-300' 
                                        : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300'
                                    }`}
                                  >
                                    {ticket.isDisplayed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    <span>{ticket.isDisplayed ? 'Displayed' : 'Hidden'}</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Regular border for Common NFTs
                        <div 
                          className={`
                            bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden
                            hover:shadow-2xl transition-all duration-500 transform hover:scale-105
                            ${rarityStyles.borderClass} ${rarityStyles.shadow}
                            ${ticket.isDisplayed ? 'ring-4 ring-purple-300/50' : ''}
                          `}
                        >
                          {viewMode === 'grid' ? (
                            <>
                              <div className="relative">
                                <img 
                                  src={ticket.eventImage} 
                                  alt={ticket.eventTitle}
                                  className="w-full h-56 object-cover"
                                />
                                <div className={`absolute top-4 right-4 px-3 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-sm bg-white/80 ${rarityStyles.badge}`}>
                                  {ticket.rarity}
                                </div>
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                                  #{ticket.tokenId}
                                </div>
                                <button
                                  onClick={() => toggleDisplayStatus(ticket.id)}
                                  className={`absolute bottom-4 right-4 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 shadow-lg ${
                                    ticket.isDisplayed 
                                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white ring-2 ring-green-300' 
                                      : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white ring-2 ring-gray-300'
                                  }`}
                                >
                                  {ticket.isDisplayed ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                </button>
                              </div>
                              
                              <div className="p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-3">{ticket.eventTitle}</h3>
                                <p className="text-purple-600 font-bold text-lg mb-3">{ticket.tierName}</p>
                                <p className="text-gray-600 mb-6 flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {ticket.date} • {ticket.location}
                                </p>
                                
                                <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Venue:</span>
                                    <span className="text-gray-900 font-semibold">{ticket.attributes.venue}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Category:</span>
                                    <span className="text-gray-900 font-semibold">{ticket.attributes.category}</span>
                                  </div>
                                  {ticket.attributes.artist && (
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-500 font-medium">Artist:</span>
                                      <span className="text-gray-900 font-semibold">{ticket.attributes.artist}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                    {ticket.price}
                                  </span>
                                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                                    ticket.isDisplayed 
                                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 ring-1 ring-green-300' 
                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300'
                                  }`}>
                                    {ticket.isDisplayed ? '👁️ Displayed' : '🙈 Hidden'}
                                  </span>
                                </div>
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center p-8 space-x-6">
                              <div className="relative">
                                <img 
                                  src={ticket.eventImage} 
                                  alt={ticket.eventTitle}
                                  className="w-24 h-24 object-cover rounded-2xl"
                                />
                                <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${rarityStyles.badge}`}>
                                  ⭐
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900">{ticket.eventTitle}</h3>
                                  <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${rarityStyles.badge}`}>
                                    {ticket.rarity}
                                  </span>
                                </div>
                                <p className="text-purple-600 font-bold mb-2">{ticket.tierName}</p>
                                <p className="text-gray-600">{ticket.date} • {ticket.location}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                                  {ticket.price}
                                </p>
                                <button
                                  onClick={() => toggleDisplayStatus(ticket.id)}
                                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                                    ticket.isDisplayed 
                                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 ring-1 ring-green-300' 
                                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 ring-1 ring-gray-300'
                                  }`}
                                >
                                  {ticket.isDisplayed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  <span>{ticket.isDisplayed ? 'Displayed' : 'Hidden'}</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* Created Events Tab */}
        {activeTab === 'created-events' && (
          <>
            {/* Controls */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <select
                    value={eventFilter}
                    onChange={(e) => setEventFilter(e.target.value)}
                    className="px-6 py-3 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 bg-white/80 backdrop-blur-sm font-medium text-lg transition-all duration-300"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="ended">Ended</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      viewMode === 'grid' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-2 ring-purple-300' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <Grid className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 ${
                      viewMode === 'list' 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg ring-2 ring-purple-300' 
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    <List className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Created Events */}
            {filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-2xl border border-white/50">
                  <Calendar className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">No events found</h3>
                  <p className="text-gray-600 text-lg">Try adjusting your filters or create your first event.</p>
                </div>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                {filteredEvents.map((event) => (
                  <div key={event.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105 border border-white/50">
                    {viewMode === 'grid' ? (
                      <>
                        <div className="relative">
                          <img 
                            src={event.imageUri} 
                            alt={event.name}
                            className="w-full h-56 object-cover"
                          />
                          <div className={`absolute top-4 right-4 px-3 py-2 rounded-xl text-sm font-bold border-2 backdrop-blur-sm bg-white/80 ${getStatusColor(event.status)}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </div>
                          <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg">
                            ID: {event.eventId}
                          </div>
                        </div>
                        
                        <div className="p-8">
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">{event.name}</h3>
                          <p className="text-gray-600 mb-6 line-clamp-2">{event.description}</p>
                          <p className="text-gray-600 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2" />
                            {event.location}
                          </p>
                          <p className="text-gray-600 mb-6 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            {event.startDate} {event.endDate && `- ${event.endDate}`}
                          </p>
                          
                          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl">
                            <div className="text-center">
                              <p className="text-3xl font-bold text-purple-600">{event.totalTicketsSold}</p>
                              <p className="text-sm text-gray-500 font-medium">Tickets Sold</p>
                            </div>
                            <div className="text-center">
                              <p className="text-3xl font-bold text-green-600">{event.totalRevenue} ETH</p>
                              <p className="text-sm text-gray-500 font-medium">Revenue</p>
                            </div>
                          </div>

                          <div className="space-y-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl">
                            {event.tiers.map((tier, index) => (
                              <div key={index} className="flex justify-between">
                                <span className="text-gray-600 font-medium">{tier.name}:</span>
                                <span className="text-gray-900 font-bold">{tier.sold}/{tier.total}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex space-x-3">
                            <button className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                              <BarChart3 className="w-5 h-5" />
                              <span className="font-medium">Analytics</span>
                            </button>
                            <button className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center p-8 space-x-6">
                        <img 
                          src={event.imageUri} 
                          alt={event.name}
                          className="w-24 h-24 object-cover rounded-2xl"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
                            <span className={`px-3 py-1 rounded-xl text-xs font-bold border-2 ${getStatusColor(event.status)}`}>
                              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-1">{event.location}</p>
                          <p className="text-gray-600">{event.startDate} {event.endDate && `- ${event.endDate}`}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-600 mb-2">{event.totalTicketsSold} sold</p>
                          <p className="text-lg text-green-600 font-bold mb-4">{event.totalRevenue} ETH</p>
                          <div className="flex space-x-2">
                            <button className="p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                              <BarChart3 className="w-5 h-5" />
                            </button>
                            <button className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-2xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                              <Edit className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create-event' && (
          <form onSubmit={handleCreateEvent} className="space-y-8">
            {/* Basic Event Information */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-2xl p-10">
              <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
                <Calendar className="h-8 w-8 mr-4 text-purple-600" />
                Event Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={eventData.name}
                    onChange={(e) => handleEventDataChange('name', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                    placeholder="Enter event name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Description *
                  </label>
                  <textarea
                    value={eventData.description}
                    onChange={(e) => handleEventDataChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 resize-none text-lg transition-all duration-300"
                    placeholder="Describe your event"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={eventData.category}
                    onChange={(e) => handleEventDataChange('category', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Event Image URL
                  </label>
                  <input
                    type="url"
                    value={eventData.imageUri}
                    onChange={(e) => handleEventDataChange('imageUri', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    <MapPin className="h-5 w-5 inline mr-2" />
                    Location
                  </label>
                  <input
                    type="text"
                    value={eventData.location}
                    onChange={(e) => handleEventDataChange('location', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                    placeholder="Event location or 'Virtual Event'"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={eventData.startDate}
                    onChange={(e) => handleEventDataChange('startDate', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={eventData.startTime}
                    onChange={(e) => handleEventDataChange('startTime', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={eventData.endDate}
                    onChange={(e) => handleEventDataChange('endDate', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={eventData.endTime}
                    onChange={(e) => handleEventDataChange('endTime', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={eventData.website}
                    onChange={(e) => handleEventDataChange('website', e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                    placeholder="https://your-event-website.com"
                  />
                </div>
              </div>
            </div>

            {/* Ticket Tiers */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-2xl p-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                  <DollarSign className="h-8 w-8 mr-4 text-purple-600" />
                  Ticket Tiers
                </h2>
                <button
                  type="button"
                  onClick={addTier}
                  className="flex items-center space-x-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Add Tier</span>
                </button>
              </div>

              <div className="space-y-8">
                {ticketTiers.map((tier, index) => (
                  <div key={index} className="p-8 rounded-3xl bg-white/60 backdrop-blur-sm border-2 border-gray-200 shadow-lg">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-gray-800">
                        Tier {index + 1}
                      </h3>
                      {ticketTiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTier(index)}
                          className="p-3 rounded-2xl text-red-600 hover:bg-red-100 transition-all duration-300 transform hover:scale-105"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Tier Name *
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                          placeholder="e.g., General Admission"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Price (ETH) *
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={tier.price}
                          onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                          placeholder="0.1"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Max Supply *
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxSupply}
                          onChange={(e) => handleTierChange(index, 'maxSupply', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                          placeholder="1000"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Max Per Wallet
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={tier.maxPerWallet}
                          onChange={(e) => handleTierChange(index, 'maxPerWallet', e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 text-lg transition-all duration-300"
                          placeholder="5"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-lg font-semibold text-gray-700 mb-3">
                          Description
                        </label>
                        <textarea
                          value={tier.description}
                          onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                          rows={3}
                          className="w-full px-6 py-4 rounded-2xl bg-white/80 backdrop-blur-sm border-2 border-gray-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-400 resize-none text-lg transition-all duration-300"
                          placeholder="Describe what this tier includes"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isCreatingEvent || !isConnected}
                className="inline-flex items-center space-x-4 px-12 py-5 rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-2xl hover:shadow-purple-300/50 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 text-xl font-bold"
              >
                {isCreatingEvent ? (
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                ) : (
                  <Save className="h-8 w-8" />
                )}
                <span>
                  {isCreatingEvent ? 'Creating Event...' : 'Create Event'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Profile
