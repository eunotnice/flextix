import React, { useState } from 'react'
import { Calendar, MapPin, DollarSign, Users, Plus, Trash2, Save } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

interface TicketTier {
  name: string
  price: string
  maxSupply: string
  maxPerWallet: string
  description: string
}

const CreateEvent = () => {
  const { isConnected, connectWallet } = useWeb3()
  const [isLoading, setIsLoading] = useState(false)
  
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

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsLoading(true)
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
      
    } catch (error) {
      toast.error('Failed to create event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Create Event
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Launch your event on the blockchain with NFT tickets and transparent smart contracts
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Event Information */}
          <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-3 text-purple-600" />
              Event Details
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  value={eventData.name}
                  onChange={(e) => handleEventDataChange('name', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter event name"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={eventData.description}
                  onChange={(e) => handleEventDataChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Describe your event"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={eventData.category}
                  onChange={(e) => handleEventDataChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Image URL
                </label>
                <input
                  type="url"
                  value={eventData.imageUri}
                  onChange={(e) => handleEventDataChange('imageUri', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={eventData.location}
                  onChange={(e) => handleEventDataChange('location', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Event location or 'Virtual Event'"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={eventData.startDate}
                  onChange={(e) => handleEventDataChange('startDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={eventData.startTime}
                  onChange={(e) => handleEventDataChange('startTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={eventData.endDate}
                  onChange={(e) => handleEventDataChange('endDate', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={eventData.endTime}
                  onChange={(e) => handleEventDataChange('endTime', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  value={eventData.website}
                  onChange={(e) => handleEventDataChange('website', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/30 backdrop-blur-sm border border-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://your-event-website.com"
                />
              </div>
            </div>
          </div>

          {/* Ticket Tiers */}
          <div className="rounded-3xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <DollarSign className="h-6 w-6 mr-3 text-purple-600" />
                Ticket Tiers
              </h2>
              <button
                type="button"
                onClick={addTier}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-700 hover:bg-purple-500/30 transition-all duration-200"
              >
                <Plus className="h-4 w-4" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-6">
              {ticketTiers.map((tier, index) => (
                <div key={index} className="p-6 rounded-2xl bg-white/30 backdrop-blur-sm border border-white/40">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Tier {index + 1}
                    </h3>
                    {ticketTiers.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTier(index)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-100/50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tier Name *
                      </label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => handleTierChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., General Admission"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (ETH) *
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={tier.price}
                        onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="0.1"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Supply *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.maxSupply}
                        onChange={(e) => handleTierChange(index, 'maxSupply', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="1000"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Per Wallet
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.maxPerWallet}
                        onChange={(e) => handleTierChange(index, 'maxPerWallet', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="5"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={tier.description}
                        onChange={(e) => handleTierChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
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
              disabled={isLoading || !isConnected}
              className="inline-flex items-center space-x-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
              ) : (
                <Save className="h-6 w-6" />
              )}
              <span className="text-lg font-semibold">
                {isLoading ? 'Creating Event...' : isConnected ? 'Create Event' : 'Connect Wallet First'}
              </span>
            </button>
            
            {!isConnected && (
              <p className="text-sm text-gray-600 mt-4">
                Please connect your wallet to create an event
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEvent
