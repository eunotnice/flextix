import React, { useState } from 'react'
import { Ticket, Calendar, MapPin, Clock, QrCode, Gift, Star, Filter } from 'lucide-react'
import { useWeb3 } from '../context/Web3Context'

const MyTickets = () => {
  const { isConnected, account } = useWeb3()
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'used'>('upcoming')

  // Mock tickets data
  const tickets = [
    {
      id: 1,
      tokenId: 12345,
      eventId: 1,
      eventTitle: 'Tech Conference 2024',
      eventImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'VIP Pass',
      date: '2024-03-15',
      time: '09:00 AM',
      location: 'San Francisco, CA',
      price: '0.3 ETH',
      purchaseDate: '2024-02-01',
      isUsed: false,
      isPast: false,
      qrCode: 'QR_CODE_DATA_12345',
      organizer: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87'
    },
    {
      id: 2,
      tokenId: 12346,
      eventId: 2,
      eventTitle: 'Music Festival Summer',
      eventImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'General Admission',
      date: '2024-06-20',
      time: '06:00 PM',
      location: 'Austin, TX',
      price: '0.2 ETH',
      purchaseDate: '2024-02-10',
      isUsed: false,
      isPast: false,
      qrCode: 'QR_CODE_DATA_12346',
      organizer: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984'
    },
    {
      id: 3,
      tokenId: 12347,
      eventId: 3,
      eventTitle: 'Art Gallery Opening',
      eventImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Collector Pass',
      date: '2024-01-15',
      time: '07:00 PM',
      location: 'New York, NY',
      price: '0.15 ETH',
      purchaseDate: '2024-01-01',
      isUsed: true,
      isPast: true,
      qrCode: 'QR_CODE_DATA_12347',
      organizer: '0x3fC91A3afd70395Cd496C647d5a6CC9D4B2b8F3A'
    },
    {
      id: 4,
      tokenId: 12348,
      eventId: 4,
      eventTitle: 'Blockchain Summit',
      eventImage: 'https://images.unsplash.com/photo-1559223607-b4d0555ae227?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      tierName: 'Premium Access',
      date: '2024-02-28',
      time: '10:00 AM',
      location: 'Miami, FL',
      price: '0.25 ETH',
      purchaseDate: '2024-01-15',
      isUsed: true,
      isPast: true,
      qrCode: 'QR_CODE_DATA_12348',
      organizer: '0x8ba1f109551bD432803012645Hac136c9c1588c9'
    }
  ]

  const filteredTickets = tickets.filter(ticket => {
    if (activeTab === 'upcoming') return !ticket.isPast && !ticket.isUsed
    if (activeTab === 'past') return ticket.isPast && !ticket.isUsed
    if (activeTab === 'used') return ticket.isUsed
    return false
  })

  const handleTransferTicket = (ticketId: number) => {
    // TODO: Implement ticket transfer functionality
    console.log('Transfer ticket:', ticketId)
  }

  const handleResellTicket = (ticketId: number) => {
    // TODO: Implement ticket resale functionality
    console.log('Resell ticket:', ticketId)
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to view your tickets</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tickets</h1>
          <p className="text-gray-600">Manage your event tickets and NFT collectibles</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'upcoming', label: 'Upcoming', count: tickets.filter(t => !t.isPast && !t.isUsed).length },
                { key: 'past', label: 'Past Events', count: tickets.filter(t => t.isPast && !t.isUsed).length },
                { key: 'used', label: 'Used Tickets', count: tickets.filter(t => t.isUsed).length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tickets Grid */}
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-600">
              {activeTab === 'upcoming' && "You don't have any upcoming events."}
              {activeTab === 'past' && "You don't have any past event tickets."}
              {activeTab === 'used' && "You don't have any used tickets."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="relative">
                  <img 
                    src={ticket.eventImage} 
                    alt={ticket.eventTitle}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    {ticket.isUsed && (
                      <span className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Used
                      </span>
                    )}
                    {ticket.isPast && !ticket.isUsed && (
                      <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Past Event
                      </span>
                    )}
                    {!ticket.isPast && !ticket.isUsed && (
                      <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                  <div className="absolute top-3 left-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    #{ticket.tokenId}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{ticket.eventTitle}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span className="text-sm">{ticket.date} at {ticket.time}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span className="text-sm">{ticket.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Star className="w-4 h-4 mr-2" />
                      <span className="text-sm">{ticket.tierName}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-purple-600">{ticket.price}</span>
                    <span className="text-sm text-gray-500">Purchased: {ticket.purchaseDate}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {!ticket.isUsed && !ticket.isPast && (
                      <>
                        <button className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors duration-200 flex items-center justify-center gap-1">
                          <QrCode className="w-4 h-4" />
                          Show QR
                        </button>
                        <button 
                          onClick={() => handleTransferTicket(ticket.id)}
                          className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors duration-200"
                        >
                          Transfer
                        </button>
                      </>
                    )}
                    
                    {!ticket.isUsed && ticket.isPast && (
                      <button 
                        onClick={() => handleResellTicket(ticket.id)}
                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors duration-200"
                      >
                        Resell
                      </button>
                    )}
                    
                    {ticket.isUsed && (
                      <button className="w-full bg-gray-400 text-white py-2 px-4 rounded-lg text-sm font-semibold cursor-not-allowed">
                        Ticket Used
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Ticket className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{tickets.length}</h3>
            <p className="text-gray-600">Total Tickets</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{tickets.filter(t => !t.isPast && !t.isUsed).length}</h3>
            <p className="text-gray-600">Upcoming Events</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Gift className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <h3 className="text-2xl font-bold text-gray-900">{tickets.reduce((sum, ticket) => sum + parseFloat(ticket.price.replace(' ETH', '')), 0).toFixed(2)} ETH</h3>
            <p className="text-gray-600">Total Value</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyTickets
