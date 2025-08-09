import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, Clock, Ticket, Star, ArrowLeft, ExternalLink, Zap, Heart, Share2 } from 'lucide-react'
import { useEventContract, Event, TicketTier } from '../hooks/useEventContract'
import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isConnected, connectWallet } = useWeb3()
  const { contract, getEvent, getEventTiers, getTicketTier, purchaseTicket, loading } = useEventContract()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [tiers, setTiers] = useState<TicketTier[]>([])
  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [eventLoading, setEventLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [purchaseStep, setPurchaseStep] = useState(0) // 0: ready, 1: processing, 2: success

  useEffect(() => {
    const fetchEventData = async () => {
      if (!contract || !id) return

      const eventId = parseInt(id)
      if (isNaN(eventId)) {
        toast.error('Invalid event ID')
        navigate('/events')
        return
      }

      try {
        setEventLoading(true)

        // Fetch event details
        console.log('🔍 Trying to fetch event ID:', eventId)
        const eventData = await getEvent(eventId)
        console.log('📦 Event data:', eventData)

        if (!eventData) {
          toast.error(`Event with ID ${eventId} not found or failed to load`)
          setEvent(null)
          return
        }

        setEvent(eventData)

        // Fetch ticket tiers
        const tierIds = await getEventTiers(eventId)
        const tierPromises = tierIds.map(tierId => getTicketTier(tierId))
        const tiersData = await Promise.all(tierPromises)
        const validTiers = tiersData.filter((tier): tier is TicketTier => tier !== null)

        setTiers(validTiers)
        if (validTiers.length > 0) {
          setSelectedTier(validTiers[0])
        }

      } catch (error) {
        console.error('❌ Error fetching event data:', error)
        toast.error('Failed to load event details')
      } finally {
        setEventLoading(false)
      }
    }

    fetchEventData()
  }, [contract, id])

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEventStatus = () => {
    if (!event) return 'unknown'
    const now = Math.floor(Date.now() / 1000)
    if (event.hasEnded) return 'ended'
    if (now >= event.startTime && now <= event.endTime) return 'live'
    if (now < event.startTime) return 'upcoming'
    return 'ended'
  }

  const handlePurchase = async () => {
    if (!selectedTier || !isConnected) {
      if (!isConnected) {
        await connectWallet()
      }
      return
    }

    try {
      setPurchaseStep(1)
      const totalPrice = ethers.formatEther(selectedTier.price * BigInt(quantity))
      await purchaseTicket(selectedTier.tierId, quantity, totalPrice)
      
      setPurchaseStep(2)
      
      // Refresh tier data to show updated supply
      const updatedTier = await getTicketTier(selectedTier.tierId)
      if (updatedTier) {
        setTiers(prev => prev.map(tier => 
          tier.tierId === updatedTier.tierId ? updatedTier : tier
        ))
        setSelectedTier(updatedTier)
      }

      // Reset after success animation
      setTimeout(() => setPurchaseStep(0), 3000)
    } catch (error) {
      console.error('Purchase failed:', error)
      setPurchaseStep(0)
    }
  }

  const canPurchase = () => {
    if (!selectedTier || !event) return false
    const status = getEventStatus()
    return status === 'upcoming' && selectedTier.currentSupply < selectedTier.maxSupply
  }

  const handleShare = () => {
    if (navigator.share && event) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Event link copied to clipboard!')
    }
  }

  if (eventLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-300 border-t-transparent"></div>
              <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-purple-500 opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-2xl font-bold text-white mb-4">Event Not Found</h1>
            <button
              onClick={() => navigate('/events')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Back to Events
            </button>
          </div>
        </div>
      </div>
    )
  }

  const status = getEventStatus()
  const statusColors = {
    upcoming: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    live: 'bg-gradient-to-r from-green-500 to-emerald-500 animate-pulse',
    ended: 'bg-gradient-to-r from-gray-500 to-gray-600',
    unknown: 'bg-gradient-to-r from-gray-500 to-gray-600'
  }
  const statusLabels = {
    upcoming: 'Upcoming',
    live: 'Live Now',
    ended: 'Ended',
    unknown: 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button with Animation */}
        <button
          onClick={() => navigate('/events')}
          className="group flex items-center text-purple-300 hover:text-white mb-6 transition-all duration-300 transform hover:translate-x-2"
        >
          <ArrowLeft className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/30 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:border-white/40">
              {/* Event Image with Overlay Effects */}
              <div className="relative h-64 md:h-80 overflow-hidden group">
                <img
                  src={event.imageUri || `https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop`}
                  alt={event.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <span className={`px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${statusColors[status]} backdrop-blur-sm`}>
                    {status === 'live' && <Zap className="w-4 h-4 inline mr-1" />}
                    {statusLabels[status]}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex space-x-2 z-10">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-all duration-300 transform hover:scale-110 ${
                      isLiked ? 'bg-red-500/80 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all duration-300 transform hover:scale-110"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Event Info */}
              <div className="p-8">
                <h1 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  {event.name}
                </h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="group flex items-center text-purple-100 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <Calendar className="w-6 h-6 mr-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
                    <div>
                      <div className="font-semibold text-lg">Starts</div>
                      <div className="text-sm opacity-80">{formatDate(event.startTime)}</div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center text-purple-100 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <Clock className="w-6 h-6 mr-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
                    <div>
                      <div className="font-semibold text-lg">Ends</div>
                      <div className="text-sm opacity-80">{formatDate(event.endTime)}</div>
                    </div>
                  </div>
                  
                  <div className="group flex items-center text-purple-100 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <Users className="w-6 h-6 mr-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
                    <div>
                      <div className="font-semibold text-lg">Organizer</div>
                      <div className="text-sm font-mono opacity-80">
                        {event.organizer.slice(0, 6)}...{event.organizer.slice(-4)}
                      </div>
                    </div>
                  </div>

                  <div className="group flex items-center text-purple-100 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 transform hover:scale-105">
                    <ExternalLink className="w-6 h-6 mr-4 text-purple-300 group-hover:text-purple-200 transition-colors" />
                    <div>
                      <div className="font-semibold text-lg">Blockchain</div>
                      <div className="text-sm opacity-80">Ethereum Sepolia</div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/20 pt-8">
                  <h2 className="text-2xl font-bold text-white mb-4">About This Event</h2>
                  <p className="text-purple-100 leading-relaxed text-lg">{event.description}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Ticket Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/20 backdrop-blur-xl rounded-3xl border border-white/30 p-8 sticky top-24 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white">Get Your NFT Tickets</h2>
                <Ticket className="w-8 h-8 text-purple-300 animate-bounce" />
              </div>

              {tiers.length === 0 ? (
                <div className="text-center py-12 animate-pulse">
                  <Ticket className="w-16 h-16 text-purple-300 mx-auto mb-6 opacity-50" />
                  <p className="text-purple-200 text-lg">No ticket tiers available yet</p>
                </div>
              ) : (
                <>
                  {/* Enhanced Tier Selection */}
                  <div className="space-y-4 mb-8">
                    {tiers.map((tier, index) => (
                      <div
                        key={tier.tierId}
                        onClick={() => setSelectedTier(tier)}
                        className={`p-6 rounded-2xl border cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                          selectedTier?.tierId === tier.tierId
                            ? 'border-purple-400 bg-gradient-to-r from-purple-500/30 to-pink-500/30 shadow-lg shadow-purple-500/25'
                            : 'border-white/30 hover:border-purple-400/70 bg-white/5 hover:bg-white/10'
                        }`}
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-white text-lg">{tier.name}</h3>
                          <div className="text-right">
                            <div className="text-xl font-bold text-white bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                              {ethers.formatEther(tier.price)} ETH
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between text-sm text-purple-200 mb-3">
                          <span>{tier.currentSupply} / {tier.maxSupply} sold</span>
                          <span>Max {tier.maxPerWallet} per wallet</span>
                        </div>
                        
                        {/* Enhanced Progress Bar */}
                        <div className="bg-white/20 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${(tier.currentSupply / tier.maxSupply) * 100}%` }}
                          >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedTier && (
                    <div className="space-y-6">
                      {/* Enhanced Quantity Selection */}
                      <div>
                        <label className="block text-white font-bold mb-3 text-lg">Quantity</label>
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          >
                            -
                          </button>
                          <div className="bg-white/15 rounded-xl px-6 py-3 border border-white/20">
                            <span className="text-2xl font-bold text-white">{quantity}</span>
                          </div>
                          <button
                            onClick={() => setQuantity(Math.min(selectedTier.maxPerWallet, quantity + 1))}
                            className="w-12 h-12 bg-white/15 border border-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/25 transition-all duration-300 transform hover:scale-110 active:scale-95"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Total Price Display */}
                      <div className="p-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-400/30 backdrop-blur-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-200 text-lg">Total Price:</span>
                          <span className="text-3xl font-bold text-white bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                            {ethers.formatEther(selectedTier.price * BigInt(quantity))} ETH
                          </span>
                        </div>
                      </div>

                      {/* Enhanced Purchase Button with States */}
                      <button
                        onClick={isConnected ? handlePurchase : connectWallet}
                        disabled={loading || !canPurchase() || purchaseStep === 1}
                        className={`w-full py-5 rounded-2xl font-bold text-white text-lg transition-all duration-300 transform relative overflow-hidden ${
                          loading || !canPurchase() || purchaseStep === 1
                            ? 'bg-gray-600 cursor-not-allowed opacity-50'
                            : purchaseStep === 2
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 scale-105'
                            : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/40 active:scale-95'
                        }`}
                      >
                        {purchaseStep === 1 ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                            Processing Transaction...
                          </div>
                        ) : purchaseStep === 2 ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-bounce mr-2">🎉</div>
                            Purchase Successful!
                          </div>
                        ) : !isConnected ? (
                          'Connect Wallet to Purchase'
                        ) : !canPurchase() ? (
                          status === 'ended' ? 'Event Ended' : 'Sold Out'
                        ) : (
                          `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                        )}
                      </button>

                      {status === 'upcoming' && (
                        <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                          <p className="text-sm text-purple-300 flex items-center justify-center">
                            <Zap className="w-4 h-4 mr-2 animate-pulse" />
                            NFT tickets will be minted to your wallet after purchase
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}

export default EventDetails
