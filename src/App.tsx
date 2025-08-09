import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import CreateEvent from './pages/CreateEvent'
import MyTickets from './pages/MyTickets'
import Profile from './pages/Profile'
import { Web3Provider, useWeb3 } from './context/Web3Context'
import TicketDetails from './pages/TicketDetails'



const NetworkBanner = () => {
  const { isConnected, isCorrectNetwork, switchToCorrectNetwork } = useWeb3()

  if (!isConnected || isCorrectNetwork) {
    return null
  }

  return (
    <div className="bg-red-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">
          Please switch to Hardhat Local network to use this application
        </span>
      </div>
      <button
        onClick={switchToCorrectNetwork}
        className="px-4 py-2 bg-white text-red-500 rounded-lg font-medium hover:bg-gray-100 transition-colors"
      >
        Switch Network
      </button>
    </div>
  )
}

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="fixed inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')] bg-cover bg-center opacity-5"></div>
          <div className="relative z-10">
            <NetworkBanner />
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<Events />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/my-tickets" element={<MyTickets />} />
                <Route path="/profile" element={<Profile />} />
                {/* <Route path="/tickets/:id" element={<TicketDetails />} /> */}
                <Route path="/my-tickets/:id" element={<TicketDetails />} />

              </Routes>
            </main>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </Web3Provider>
  )
}

export default App
