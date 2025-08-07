import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWeb3 } from '../context/Web3Context'
import toast from 'react-hot-toast'

const CONTRACT_ADDRESS = import.meta.env.VITE_EVENT_TICKETING_CONTRACT

// Import the actual ABI from the JSON file
import contractData from '../contracts/EventTicketing.json'

const EVENT_TICKETING_ABI = JSON.parse(contractData.abi)

// Debug environment variables
console.log('=== ENVIRONMENT VARIABLES ===')
console.log('VITE_EVENT_TICKETING_CONTRACT:', import.meta.env.VITE_EVENT_TICKETING_CONTRACT)
console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS)
console.log('All env vars:', import.meta.env)

export interface Event {
  eventId: number
  name: string
  description: string
  imageUri: string
  organizer: string
  startTime: number
  endTime: number
  isActive: boolean
  hasEnded: boolean
}

export interface TicketTier {
  tierId: number
  eventId: number
  name: string
  price: bigint
  maxSupply: number
  currentSupply: number
  maxPerWallet: number
  metadataUri: string
  isActive: boolean
}

export interface Ticket {
  tokenId: number
  eventId: number
  tierId: number
  owner: string
  isUsed: boolean
  purchaseTime: number
}

export const useEventContract = () => {
  const { signer, provider, isConnected } = useWeb3()
  const [contract, setContract] = useState<ethers.Contract | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    console.log('=== CONTRACT INITIALIZATION ===')
    console.log('Provider available:', !!provider)
    console.log('Signer available:', !!signer)
    console.log('Is connected:', isConnected)
    console.log('CONTRACT_ADDRESS:', CONTRACT_ADDRESS)
    console.log('CONTRACT_ADDRESS type:', typeof CONTRACT_ADDRESS)
    console.log('CONTRACT_ADDRESS length:', CONTRACT_ADDRESS?.length)
    
    if (provider && CONTRACT_ADDRESS) {
      console.log('✅ Creating contract instance...')
      try {
        // Validate contract address format
        if (!CONTRACT_ADDRESS.startsWith('0x') || CONTRACT_ADDRESS.length !== 42) {
          console.error('❌ Invalid contract address format:', CONTRACT_ADDRESS)
          setContract(null)
          return
        }
        
        const eventContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          EVENT_TICKETING_ABI,
          provider
        )
        setContract(eventContract)
        console.log('✅ Contract instance created successfully')
        
        // Test the contract
        eventContract.name().then((name: string) => {
          console.log('✅ Contract name:', name)
        }).catch((error: any) => {
          console.error('❌ Failed to get contract name:', error)
        })
        
        // Test contract address
        eventContract.getAddress().then((address: string) => {
          console.log('✅ Contract address from contract:', address)
        }).catch((error: any) => {
          console.error('❌ Failed to get contract address:', error)
        })
      } catch (error) {
        console.error('❌ Error creating contract instance:', error)
        setContract(null)
      }
    } else {
      console.log('❌ Missing provider or contract address')
      console.log('Provider:', !!provider)
      console.log('Contract address:', CONTRACT_ADDRESS)
      console.log('Provider type:', typeof provider)
      console.log('Contract address type:', typeof CONTRACT_ADDRESS)
      setContract(null)
    }
  }, [provider])

  const getContractWithSigner = () => {
    console.log('=== GET CONTRACT WITH SIGNER ===')
    console.log('Contract available:', !!contract)
    console.log('Signer available:', !!signer)
    
    if (!contract) {
      console.error('❌ Contract not available')
      throw new Error('Contract not available')
    }
    
    if (!signer) {
      console.error('❌ Signer not available')
      throw new Error('Signer not available')
    }
    
    console.log('✅ Contract and signer available, connecting...')
    const contractWithSigner = contract.connect(signer) as any
    console.log('✅ Contract connected with signer')
    return contractWithSigner
  }

  const createEvent = async (
    name: string,
    description: string,
    imageUri: string,
    startTime: Date,
    endTime: Date
  ) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const startTimestamp = Math.floor(startTime.getTime() / 1000)
      const endTimestamp = Math.floor(endTime.getTime() / 1000)

      const tx = await contractWithSigner.createEvent(
        name,
        description,
        imageUri,
        startTimestamp,
        endTimestamp
      )

      toast.loading('Creating event...', { id: 'create-event' })
      const receipt = await tx.wait()
      
      // Find the EventCreated event in the logs
      const eventCreatedLog = receipt.logs.find((log: any) => {
        try {
          const parsed = contract?.interface.parseLog(log)
          return parsed?.name === 'EventCreated'
        } catch {
          return false
        }
      })

      let eventId = 0
      if (eventCreatedLog) {
        const parsed = contract?.interface.parseLog(eventCreatedLog)
        eventId = Number(parsed?.args.eventId)
      }

      toast.success('Event created successfully!', { id: 'create-event' })
      return { eventId, txHash: tx.hash }
    } catch (error: any) {
      console.error('Error creating event:', error)
      toast.error(error.reason || 'Failed to create event', { id: 'create-event' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createTicketTier = async (
    eventId: number,
    name: string,
    price: string,
    maxSupply: number,
    maxPerWallet: number,
    metadataUri: string
  ) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const priceInWei = ethers.parseEther(price)

      const tx = await contractWithSigner.createTicketTier(
        eventId,
        name,
        priceInWei,
        maxSupply,
        maxPerWallet,
        metadataUri
      )

      toast.loading('Creating ticket tier...', { id: 'create-tier' })
      const receipt = await tx.wait()

      // Find the TierCreated event in the logs
      const tierCreatedLog = receipt.logs.find((log: any) => {
        try {
          const parsed = contract?.interface.parseLog(log)
          return parsed?.name === 'TierCreated'
        } catch {
          return false
        }
      })

      let tierId = 0
      if (tierCreatedLog) {
        const parsed = contract?.interface.parseLog(tierCreatedLog)
        tierId = Number(parsed?.args.tierId)
      }

      toast.success('Ticket tier created successfully!', { id: 'create-tier' })
      return { tierId, txHash: tx.hash }
    } catch (error: any) {
      console.error('Error creating ticket tier:', error)
      toast.error(error.reason || 'Failed to create ticket tier', { id: 'create-tier' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const purchaseTicket = async (tierId: number, quantity: number, totalPrice: string) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const priceInWei = ethers.parseEther(totalPrice)

      const tx = await contractWithSigner.purchaseTicket(tierId, quantity, {
        value: priceInWei
      })

      toast.loading('Purchasing tickets...', { id: 'purchase-ticket' })
      await tx.wait()

      toast.success(`Successfully purchased ${quantity} ticket(s)!`, { id: 'purchase-ticket' })
      return tx.hash
    } catch (error: any) {
      console.error('Error purchasing ticket:', error)
      toast.error(error.reason || 'Failed to purchase ticket', { id: 'purchase-ticket' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getEvent = async (eventId: number): Promise<Event | null> => {
    try {
      if (!contract) return null
      
      const eventData = await contract.events(eventId)
      return {
        eventId: Number(eventData.eventId),
        name: eventData.name,
        description: eventData.description,
        imageUri: eventData.imageUri,
        organizer: eventData.organizer,
        startTime: Number(eventData.startTime),
        endTime: Number(eventData.endTime),
        isActive: eventData.isActive,
        hasEnded: eventData.hasEnded
      }
    } catch (error) {
      console.error('Error getting event:', error)
      return null
    }
  }

  const getTicketTier = async (tierId: number): Promise<TicketTier | null> => {
    try {
      if (!contract) return null
      
      const tierData = await contract.ticketTiers(tierId)
      return {
        tierId: Number(tierData.tierId),
        eventId: Number(tierData.eventId),
        name: tierData.name,
        price: tierData.price,
        maxSupply: Number(tierData.maxSupply),
        currentSupply: Number(tierData.currentSupply),
        maxPerWallet: Number(tierData.maxPerWallet),
        metadataUri: tierData.metadataUri,
        isActive: tierData.isActive
      }
    } catch (error) {
      console.error('Error getting ticket tier:', error)
      return null
    }
  }

  const getEventTiers = async (eventId: number): Promise<number[]> => {
    try {
      if (!contract) return []
      
      const tierIds = await contract.getEventTiers(eventId)
      return tierIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('Error getting event tiers:', error)
      return []
    }
  }

  const getUserTickets = async (userAddress: string, eventId: number): Promise<number[]> => {
    try {
      if (!contract) return []
      
      const ticketIds = await contract.getUserTickets(userAddress, eventId)
      return ticketIds.map((id: bigint) => Number(id))
    } catch (error) {
      console.error('Error getting user tickets:', error)
      return []
    }
  }

  const getTicket = async (tokenId: number): Promise<Ticket | null> => {
    try {
      if (!contract) return null
      
      const ticketData = await contract.tickets(tokenId)
      return {
        tokenId: Number(ticketData.tokenId),
        eventId: Number(ticketData.eventId),
        tierId: Number(ticketData.tierId),
        owner: ticketData.owner,
        isUsed: ticketData.isUsed,
        purchaseTime: Number(ticketData.purchaseTime)
      }
    } catch (error) {
      console.error('Error getting ticket:', error)
      return null
    }
  }

  const useTicket = async (tokenId: number) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const tx = await contractWithSigner.useTicket(tokenId)
      
      toast.loading('Using ticket...', { id: 'use-ticket' })
      await tx.wait()

      toast.success('Ticket used successfully!', { id: 'use-ticket' })
      return tx.hash
    } catch (error: any) {
      console.error('Error using ticket:', error)
      toast.error(error.reason || 'Failed to use ticket', { id: 'use-ticket' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  const endEvent = async (eventId: number) => {
    try {
      setLoading(true)
      const contractWithSigner = getContractWithSigner()
      
      const tx = await contractWithSigner.endEvent(eventId)
      
      toast.loading('Ending event...', { id: 'end-event' })
      await tx.wait()

      toast.success('Event ended successfully!', { id: 'end-event' })
      return tx.hash
    } catch (error: any) {
      console.error('Error ending event:', error)
      toast.error(error.reason || 'Failed to end event', { id: 'end-event' })
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    contract,
    loading,
    isConnected,
    createEvent,
    createTicketTier,
    purchaseTicket,
    getEvent,
    getTicketTier,
    getEventTiers,
    getUserTickets,
    getTicket,
    useTicket,
    endEvent
  }
}
