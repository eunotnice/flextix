import { useState, useEffect } from 'react'
import { useEventContract, Event } from './useEventContract'
import { useWeb3 } from '../context/Web3Context'

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { contract, loading: contractLoading } = useEventContract() // Get loading state
  const { provider, isConnected, isCorrectNetwork } = useWeb3()

  const fetchEvents = async () => {
    if (contractLoading) {
      console.log('⏳ Waiting for contract to initialize...')
      return
    }
    
    console.log('=== FETCH EVENTS START ===')
    console.log('Contract available:', !!contract)
    console.log('Is connected:', isConnected)
    console.log('Is correct network:', isCorrectNetwork)
    
    if (!contract) {
      console.log('❌ No contract available')
      setLoading(false)
      return
    }

    if (!isConnected) {
      console.log('❌ Wallet not connected')
      setLoading(false)
      return
    }

    if (!isCorrectNetwork) {
      console.log('❌ Not connected to correct network')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      console.log('✅ All checks passed, fetching events...')
      
      /*
      // Test contract connection first
      try {
        const contractName = await contract.name()
        console.log('✅ Contract name:', contractName)
      } catch (error) {
        console.error('❌ Failed to get contract name:', error)
        setLoading(false)
        return
      }
      */

      // Method 1: Try to get events from EventCreated logs
      console.log('🔍 Looking for EventCreated logs...')
      if (!provider) {
        console.log('❌ No provider available')
        setLoading(false)
        return
      }

      const filter = contract.filters.EventCreated(null, null)
      const currentBlock = await provider.getBlockNumber()
      const fromBlock = Math.max(currentBlock - 5000, 0)
      const eventLogs = await contract.queryFilter(filter, fromBlock, 'latest')
      console.log('📊 Found event logs:', eventLogs.length)
      
      let eventsData: Event[] = []
      
      if (eventLogs.length > 0) {
        console.log('📝 Processing event logs...')
        const eventPromises = eventLogs.map(async (log) => {
          let parsed
          try {
            parsed = contract.interface.parseLog(log)
          } catch (err) {
            console.warn('⚠️ Failed to parse log:', err)
            return null
          }

          const eventId = Number(parsed?.args.eventId)
          console.log('🆔 Processing event ID:', eventId)
          
          try {
            const eventData = await contract.events(eventId)
            console.log('✅ Event data for ID', eventId, ':', eventData.name)
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
            console.error(`❌ Error fetching event ${eventId}:`, error)
            return null
          }
        })

        const fetchedEvents = await Promise.all(eventPromises)
        eventsData = fetchedEvents.filter((event): event is Event => event !== null)
        console.log('✅ Events from logs:', eventsData.length)
      } else {
        // Method 2: Try to fetch events by checking event IDs manually
        console.log('🔍 No EventCreated logs found, trying manual fetch...')
        const maxEventsToCheck = 10 // Check first 10 possible event IDs
        
        for (let i = 0; i < maxEventsToCheck; i++) {
          try {
            const eventData = await contract.events(i)
            await new Promise((res) => setTimeout(res, 200))
            console.log(`🔍 Checking event ID ${i}:`, eventData.name)
            
            if (eventData.name && eventData.name !== '') {
              console.log(`✅ Found valid event at ID ${i}:`, eventData.name)
              eventsData.push({
                eventId: Number(eventData.eventId),
                name: eventData.name,
                description: eventData.description,
                imageUri: eventData.imageUri,
                organizer: eventData.organizer,
                startTime: Number(eventData.startTime),
                endTime: Number(eventData.endTime),
                isActive: eventData.isActive,
                hasEnded: eventData.hasEnded
              })
            }
          } catch (error) {
            // Event doesn't exist at this ID, continue
            console.log(`❌ No event found at ID ${i}`)
          }
        }
      }
      
      console.log('📊 Final events found:', eventsData.length)
      console.log('📋 Events:', eventsData)
      
      // Sort by creation time (most recent first)
      eventsData.sort((a, b) => b.eventId - a.eventId)
      
      setEvents(eventsData)
      console.log('=== FETCH EVENTS END ===')
    } catch (error) {
      console.error('❌ Error fetching events:', error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (contract && provider && isConnected && isCorrectNetwork) {
      fetchEvents()
    }
  }, [contract, provider, isConnected, isCorrectNetwork])

 
  const refetch = () => {
    if (!loading) {
      console.log('🔄 Refetching events...')
      fetchEvents()
    }
  }

  return {
    events,
    loading,
    refetch
  }
}
