import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Star, Shield, Gift, ArrowLeft, Ticket, ExternalLink } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

const EventDetails = () => {
  const { id } = useParams()
  const { isConnected, connectWallet } = useWeb3()
  const [selectedTier, setSelectedTier] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  // Mock event data (in real app, fetch from blockchain)
  const event = {
    id: parseInt(id || '1'),
    title: 'Tech Conference 2024',
    description: 'The biggest tech conference of the year featuring industry leaders and cutting-edge innovations. Join us for three days of inspiring talks, networking opportunities, and hands-on workshops that will shape the future of technology.',
    longDescription: `
      This premier technology conference brings together the brightest minds in the industry to share insights, innovations, and the future of tech. Over three action-packed days, you'll experience:

      • Keynote presentations from industry leaders
      • Interactive workshops and hands-on sessions  
      • Networking opportunities with peers and experts
      • Exhibition showcasing the latest technologies
      • Panel discussions on emerging trends
      • Startup pitch competitions
      • After-party events and social gatherings

      Whether you're a developer, entrepreneur, investor, or tech enthusiast, this conference offers something valuable for everyone. Don't miss this opportunity to be part of the conversation that's shaping our digital future.
    `,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    date: '2024-03-15',
    endDate: '2024-03-17',
    time: '09:00 AM',
    location: 'Moscone Center, San Francisco, CA',
    organizer: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    organizerName: 'TechEvents Inc.',
    attendees: 1250,
    maxAttendees: 2000,
    category: 'technology',
    rating: 4.8,
    reviews: 156,
    website: 'https://techconf2024.com',
    tiers: [
      { 
        id: 0,
        name: 'General Admission', 
        price: '0.1 ETH', 
        priceUSD: '$180',
        available: 500,
        total: 1000,
        maxPerWallet: 5,
        description: 'Access to all main sessions, exhibition hall, and networking areas',
        benefits: [
          'All keynote sessions',
          'Exhibition hall access',
          'Networking areas',
          'Welcome kit',
          'Lunch included'
        ]
      },
      { 
        id: 1,
        name: 'VIP Pass', 
        price: '0.3 ETH', 
        priceUSD: '$540',
        available: 100,
        total: 200,
        maxPerWallet: 3,
        description: 'Premium experience with exclusive access and perks',
        benefits: [
          'All General Admission benefits',
          'VIP lounge access',
          'Priority seating',
          'Exclusive networking dinner',
          'Meet & greet with speakers',
          'Premium welcome kit'
        ]
      },
      { 
        id: 2,
        name: 'Premium Experience', 
        price: '0.5 ETH', 
        priceUSD: '$900',
        available: 50,
        total: 100,
        maxPerWallet: 2,
        description: 'Ultimate conference experience with all-access privileges',
        benefits: [
          'All VIP Pass benefits',
          'Backstage access',
          'Private workshops',
          'One-on-one mentoring sessions',
          'Exclusive after-party access',
          'Luxury welcome package',
          'Guaranteed front-row seating'
        ]
      }
    ],
    blindBagRewards: [
      { name: 'Tech Innovator Badge', rarity: 'Common', chance: '50%' },
      { name: 'Future Builder Sticker', rarity: 'Uncommon', chance: '30%' },
      { name: 'Digital Pioneer Effect', rarity: 'Rare', chance: '15%' },
      { name: 'Visionary Leader Badge', rarity: 'Epic', chance: '4%' },
      { name: 'Tech Legend Crown', rarity: 'Legendary', chance: '1%' }
    ]
  }

  const handlePurchase = async () => {
    if (!isConnected) {
      await connectWallet()
      return
    }

    if (selectedTier === null) {
      toast.error('Please select a ticket tier')
      return
    }

    setIsLoading(true)
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`Successfully purchased ${quantity} ticket(s)!`)
      // In real app, call smart contract function
    } catch (error) {
      toast.error('Transaction failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600'
      case 'uncommon': return 'text-green-600'
      case 'rare': return 'text-blue-600'
      case 'epic': return 'text-purple-600'
      case 'legendary': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          to="/events"
          className="inline-flex items-center space-x-2 mb-8 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 hover:bg-white/30 transition-all duration-200 shadow-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Events</span>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg overflow-hidden">
              <div className="relative h-64 md:h-80">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium capitalize">
                      {event.category}
                    </span>
                    <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{event.rating}</span>
                      <span className="text-sm">({event.reviews})</span>
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {event.title}
                  </h1>
                  <p className="text-white/90 text-lg">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Event Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <div className="font-medium">{formatDate(event.date)}</div>
                      <div className="text-sm text-gray-600">
                        {event.endDate && `to ${formatDate(event.endDate)}`} at {event.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-gray-700">
                    <Users className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.attendees.toLocaleString()} / {event.maxAttendees.toLocaleString()}</div>
                      <div className="text-sm text-gray-600">Attendees</div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <Shield className="h-5 w-5 mr-3 text-purple-600" />
                    <div>
                      <div className="font-medium">{event.organizerName}</div>
                      <div className="text-sm text-gray-600 font-mono">
                        {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {event.website && (
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 transition-all duration-200"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Visit Event Website</span>
                </a>
              )}
            </div>

            {/* Description */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">About This Event</h2>
              <div className="prose prose-gray max-w-none">
                {event.longDescription.split('\n').map((paragraph, index) => (
                  paragraph.trim() && (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4">
                      {paragraph.trim()}
                    </p>
                  )
                ))}
              </div>
            </div>

            {/* Blind Bag Rewards */}
            <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Gift className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">Blind Bag Rewards</h2>
              </div>
              <p className="text-gray-600 mb-6">
                Attend this event and claim exclusive NFT rewards after it ends! Each attendee gets one random reward.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {event.blindBagRewards.map((reward, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
                    <div>
                      <div className="font-medium text-gray-800">{reward.name}</div>
                      <div className={`text-sm font-medium ${getRarityColor(reward.rarity)}`}>
                        {reward.rarity}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {reward.chance}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Purchase */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Select Tickets</h3>
                
                {/* Ticket Tiers */}
                <div className="space-y-4 mb-6">
                  {event.tiers.map((tier) => (
                    <div
                      key={tier.id}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedTier === tier.id
                          ? 'border-purple-500 bg-purple-500/10'
                          : 'border-white/30 bg-white/10 hover:border-purple-300'
                      }`}
                      onClick={() => setSelectedTier(tier.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-gray-800">{tier.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-purple-600">{tier.price}</div>
                          <div className="text-sm text-gray-600">{tier.priceUSD}</div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        {tier.available} of {tier.total} available
                      </div>
                      
                      <div className="space-y-1">
                        {tier.benefits.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="text-sm text-gray-600 flex items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mr-2" />
                            {benefit}
                          </div>
                        ))}
                        {tier.benefits.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{tier.benefits.length - 3} more benefits
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quantity Selector */}
                {selectedTier !== null && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity (max {event.tiers[selectedTier].maxPerWallet})
                    </label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {Array.from({ length: Math.min(event.tiers[selectedTier].maxPerWallet, event.tiers[selectedTier].available) }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Total */}
                {selectedTier !== null && (
                  <div className="mb-6 p-4 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Total:</span>
                      <div className="text-right">
                        <div className="font-bold text-xl text-purple-600">
                          {(parseFloat(event.tiers[selectedTier].price.replace(' ETH', '')) * quantity).toFixed(3)} ETH
                        </div>
                        <div className="text-sm text-gray-600">
                          ~${(parseFloat(event.tiers[selectedTier].priceUSD.replace('$', '')) * quantity).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  disabled={isLoading || selectedTier === null}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Ticket className="h-5 w-5" />
                      <span className="font-semibold">
                        {isConnected ? 'Purchase Tickets' : 'Connect Wallet'}
                      </span>
                    </>
                  )}
                </button>

                {selectedTier !== null && (
                  <p className="text-xs text-gray-600 mt-4 text-center">
                    Secure payment via blockchain. Gas fees apply.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
