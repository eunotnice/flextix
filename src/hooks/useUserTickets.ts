import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useEventContract, Ticket, Event, TicketTier } from './useEventContract';

export interface UserTicketWithDetails extends Ticket {
  event: Event | null;
  tier: TicketTier | null;
}

export const useUserTickets = () => {
  const [tickets, setTickets] = useState<UserTicketWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const { account } = useWeb3();
  const { contract, getEvent, getTicketTier, getTicket } = useEventContract();

  const fetchUserTickets = async () => {
    if (!contract || !account) {
      console.log('⚠️ No contract or account. Skipping fetch.');
      setTickets([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('🔍 Fetching tickets for account:', account);

      let tokenIds: number[] = [];

      // Method 1: Try event filtering first
      try {
        const filter = contract.filters.TicketPurchased(null, null, null, account);
        const purchaseEvents = await contract.queryFilter(filter);
        
        tokenIds = purchaseEvents
          .map((log) => {
            if ("args" in log) {
              const args = log.args as unknown as {
                tokenId: bigint;
                eventId: bigint;
                tierId: bigint;
                buyer: string;
              };
              return Number(args.tokenId);
            }
            return NaN;
          })
          .filter((id): id is number => !isNaN(id));

        console.log('🎟️ Token IDs from events:', tokenIds);
      } catch (eventError) {
        console.error('❌ Error querying events:', eventError);
      }

      // Method 2: Fallback to enumeration if available
      if (tokenIds.length === 0) {
        try {
          const balance = await contract.balanceOf(account);
          console.log(`💰 User has ${balance} tokens`);

          const tokenPromises = [];
          for (let i = 0; i < balance; i++) {
            tokenPromises.push(contract.tokenOfOwnerByIndex(account, i));
          }
          tokenIds = (await Promise.all(tokenPromises)).map(id => Number(id));
          console.log('🎟️ Token IDs from balance:', tokenIds);
        } catch (enumError) {
          console.error('❌ Error using token enumeration:', enumError);
        }
      }

      // Process each token to get full ticket details
      const ticketPromises = tokenIds.map(async (tokenId) => {
        try {
          const ticket = await getTicket(tokenId);
          const event = await getEvent(ticket.eventId);
          const tier = await getTicketTier(ticket.tierId);
          
          return {
            ...ticket,
            event,
            tier,
          };
        } catch (error) {
          console.error(`❌ Error processing token ${tokenId}:`, error);
          return {
            tokenId,
            eventId: 0, // Default
            tierId: 0,  // Default
            purchaseTime: Math.floor(Date.now() / 1000),
            isUsed: false,
            owner: account, // ✅ Add this!
            event: null,
            tier: null,
          };
        }
      });

      const userTickets = (await Promise.all(ticketPromises)).filter(Boolean);
      setTickets(userTickets);
    } catch (err) {
      console.error('❌ Error in fetchUserTickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [account, contract]);

  return { tickets, loading, refresh: fetchUserTickets };
};