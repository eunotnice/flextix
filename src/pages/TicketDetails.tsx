import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, Clock, ExternalLink, Star, ArrowLeft, Gift, Zap, CheckCircle, Copy } from 'lucide-react';
import { useEventContract } from '../hooks/useEventContract';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

interface TicketDetails {
    tokenId: number;
    eventId: number;
    tierId: number;
    owner: string;
    isUsed: boolean;
    purchaseTime: number;
    event?: {
        eventId: number;
        name: string;
        description: string;
        imageUri: string;
        startTime: number;
        endTime: number;
        organizer: string;
        isActive?: boolean;
        hasEnded?: boolean;
    };
    tier?: {
        name: string;
        price: bigint;
    };
}

const TicketDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    console.log('TicketDetails component loaded with id:', id);

    const navigate = useNavigate();

    const { isConnected, account, chainId } = useWeb3();
    const { getTicket, getEvent, getTicketTier, hasClaimedBlindBag, claimBlindBag, contract, loading: contractLoading } = useEventContract();

    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [qrOpen, setQrOpen] = useState(false);
    const [hasClaimed, setHasClaimed] = useState<boolean>(false);
    const [claimModalOpen, setClaimModalOpen] = useState<boolean>(false);
    const [claimResult, setClaimResult] = useState<{ txHash: string, rewardId?: number } | null>(null);
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const fetchInProgressRef = useRef(false);
    const lastFetchedIdRef = useRef<string | null>(null);

    // Entrance animation trigger
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    // Copy to clipboard functionality
    const copyToClipboard = async (text: string, fieldName: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(fieldName);
            toast.success(`${fieldName} copied!`);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const fetchTicketData = async () => {
            if (!id) {
                toast.error('Invalid ticket ID');
                navigate('/my-tickets');
                return;
            }

            // Wait for contract to be ready
            if (contractLoading || !contract) {
                console.log('⏳ Contract not ready yet. Waiting to fetch ticket...');
                return;
            }

            // Prevent duplicate fetches
            const fetchingRef = fetchInProgressRef;
            const lastIdRef = lastFetchedIdRef;
            if (fetchingRef.current) {
                return;
            }
            if (lastIdRef.current === id && ticket) {
                return;
            }

            try {
                setLoading(true);
                fetchingRef.current = true;
                const ticketId = parseInt(id);

                // Fetch basic ticket info
                const ticketData = await getTicket(ticketId);
                console.log('Raw ticketData from contract:', ticketData);
                if (!ticketData) {
                    toast.error('Ticket not found');
                    navigate('/my-tickets');
                    return;
                }

                // Fetch additional event and tier info
                const [eventData, tierData] = await Promise.all([
                    getEvent(ticketData.eventId),
                    getTicketTier(ticketData.tierId)
                ]);

                const composedTicket = {
                    ...ticketData,
                    event: eventData || undefined,
                    tier: tierData || undefined
                } as TicketDetails;
                setTicket(composedTicket);

                // Determine lucky draw claimed status when event present
                if (account && composedTicket.event) {
                    try {
                        const claimed = await hasClaimedBlindBag(account, composedTicket.event.eventId);
                        setHasClaimed(claimed);
                    } catch (e) {
                        console.warn('Unable to check lucky draw claim status');
                    }
                }

            } catch (error) {
                console.error('Error fetching ticket data:', error);
                toast.error('Failed to load ticket details');
                navigate('/my-tickets');
            } finally {
                setLoading(false);
                fetchInProgressRef.current = false;
                lastFetchedIdRef.current = id ?? null;
            }
        };

        fetchTicketData();
    }, [id, contract, contractLoading, account]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getNetworkName = (id: number | null | undefined) => {
        switch (id) {
            case 31337: return 'Hardhat Local';
            case 1: return 'Ethereum Mainnet';
            case 11155111: return 'Sepolia';
            case 5: return 'Goerli';
            case 137: return 'Polygon';
            case 80001: return 'Mumbai';
            case 56: return 'BSC';
            case 97: return 'BSC Testnet';
            case 10: return 'Optimism';
            case 42161: return 'Arbitrum One';
            case 8453: return 'Base';
            case 84532: return 'Base Sepolia';
            default: return 'Unknown';
        }
    };

    const getTicketStatus = () => {
        if (!ticket?.event) return { status: 'Valid', color: 'blue', icon: Ticket };
        
        const now = Math.floor(Date.now() / 1000);
        const isEventOver = Boolean(ticket.event.hasEnded) || now >= ticket.event.endTime;
        
        if (ticket.isUsed) {
            return { status: 'Used', color: 'green', icon: CheckCircle };
        } else if (isEventOver) {
            return { status: 'Expired', color: 'red', icon: Clock };
        } else {
            return { status: 'Valid', color: 'blue', icon: Ticket };
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex justify-center items-center h-64">
                        <div className="relative">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-transparent"></div>
                            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-pink-200 border-b-transparent opacity-75"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="animate-bounce mb-4">
                            <Ticket className="w-16 h-16 text-purple-300 mx-auto" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-4">Ticket Not Found</h1>
                        <button
                            onClick={() => navigate('/my-tickets')}
                            className="group bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                        >
                            <span className="flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                Back to My Tickets
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const ticketStatus = getTicketStatus();
    const StatusIcon = ticketStatus.icon;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20">
            <div className="container mx-auto px-4 py-8">
                {/* Back Button with hover animation */}
                <button
                    onClick={() => navigate('/my-tickets')}
                    className={`group flex items-center text-purple-300 hover:text-white mb-6 transition-all duration-300 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                    Back to My Tickets
                </button>

                {/* Ticket Card with entrance animation */}
                <div className={`max-w-2xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden border border-white/20 shadow-2xl transition-all duration-700 transform ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-95'}`}>
                    {/* Ticket Header with gradient animation */}
                    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 animate-gradient-x p-6 relative overflow-hidden">
                        {/* Animated background elements */}
                        <div className="absolute inset-0 opacity-20">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 animate-bounce"></div>
                        </div>
                        
                        <div className="flex justify-between items-start relative z-10">
                            <div className="animate-fade-in">
                                <h1 className="text-2xl font-bold text-white hover:text-purple-100 transition-colors duration-300">
                                    {ticket.event?.name || 'Unknown Event'}
                                </h1>
                                <p className="text-purple-100 font-medium">
                                    {ticket.tier?.name || 'General Admission'}
                                </p>
                            </div>
                            <div className="text-right space-y-2">
                                <div className="animate-slide-in-right">
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300 cursor-pointer"
                                          onClick={() => copyToClipboard(ticket.tokenId.toString(), 'Ticket ID')}>
                                        Ticket #{ticket.tokenId}
                                        {copiedField === 'Ticket ID' && <Copy className="inline w-3 h-3 ml-1" />}
                                    </span>
                                </div>
                                
                                {/* Enhanced Lucky Draw button */}
                                {(() => {
                                    if (!ticket.event) return null;
                                    const nowSec = Math.floor(Date.now() / 1000);
                                    const isEventOver = Boolean(ticket.event.hasEnded) || nowSec >= ticket.event.endTime;
                                    if (!isEventOver) return null;
                                    return (
                                        <div className="animate-fade-in-up">
                                            <button
                                                disabled={hasClaimed}
                                                onClick={() => setClaimModalOpen(true)}
                                                className={`group inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 transform ${
                                                    hasClaimed 
                                                        ? 'bg-gray-400/50 text-gray-300 cursor-not-allowed' 
                                                        : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 hover:from-yellow-300 hover:to-orange-300 hover:scale-105 hover:shadow-lg active:scale-95'
                                                }`}
                                            >
                                                <Gift className={`w-4 h-4 mr-2 ${!hasClaimed && 'group-hover:rotate-12 group-hover:animate-bounce'}`} />
                                                {hasClaimed ? 'Drawn' : 'Lucky Draw'}
                                                {!hasClaimed && <Zap className="w-3 h-3 ml-1 animate-pulse" />}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-6">
                        {/* Event Image with hover effect */}
                        {ticket.event?.imageUri && (
                            <div className="mb-6 rounded-lg overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                                <img
                                    src={ticket.event.imageUri}
                                    alt={ticket.event.name}
                                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        )}

                        {/* Enhanced Ticket Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {/* Start Date */}
                            <div className="group flex items-start text-purple-200 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                 onClick={() => ticket.event && copyToClipboard(formatDate(ticket.event.startTime), 'Start Date')}>
                                <Calendar className="w-5 h-5 mr-3 mt-1 group-hover:text-purple-100 group-hover:scale-110 transition-all duration-200" />
                                <div>
                                    <div className="font-semibold group-hover:text-white transition-colors duration-200">Event Start</div>
                                    <div className="text-sm">
                                        {ticket.event ? formatDate(ticket.event.startTime) : 'N/A'}
                                    </div>
                                </div>
                                {copiedField === 'Start Date' && <Copy className="w-4 h-4 ml-auto text-green-400" />}
                            </div>

                            {/* Purchase Date */}
                            <div className="group flex items-start text-purple-200 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                 onClick={() => copyToClipboard(formatDate(ticket.purchaseTime), 'Purchase Date')}>
                                <Clock className="w-5 h-5 mr-3 mt-1 group-hover:text-purple-100 group-hover:scale-110 transition-all duration-200" />
                                <div>
                                    <div className="font-semibold group-hover:text-white transition-colors duration-200">Purchased</div>
                                    <div className="text-sm">{formatDate(ticket.purchaseTime)}</div>
                                </div>
                                {copiedField === 'Purchase Date' && <Copy className="w-4 h-4 ml-auto text-green-400" />}
                            </div>

                            {/* End Date */}
                            <div className="group flex items-start text-purple-200 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                 onClick={() => ticket.event && copyToClipboard(formatDate(ticket.event.endTime), 'End Date')}>
                                <Calendar className="w-5 h-5 mr-3 mt-1 group-hover:text-purple-100 group-hover:scale-110 transition-all duration-200" />
                                <div>
                                    <div className="font-semibold group-hover:text-white transition-colors duration-200">Event End</div>
                                    <div className="text-sm">
                                        {ticket.event ? formatDate(ticket.event.endTime) : 'N/A'}
                                    </div>
                                </div>
                                {copiedField === 'End Date' && <Copy className="w-4 h-4 ml-auto text-green-400" />}
                            </div>

                            {/* Token ID */}
                            <div className="group flex items-start text-purple-200 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                 onClick={() => copyToClipboard(`#${ticket.tokenId}`, 'Token ID')}>
                                <ExternalLink className="w-5 h-5 mr-3 mt-1 group-hover:text-purple-100 group-hover:scale-110 transition-all duration-200" />
                                <div>
                                    <div className="font-semibold group-hover:text-white transition-colors duration-200">Token ID</div>
                                    <div className="text-sm font-mono">#{ticket.tokenId}</div>
                                </div>
                                {copiedField === 'Token ID' && <Copy className="w-4 h-4 ml-auto text-green-400" />}
                            </div>

                            {/* Status with enhanced styling */}
                            <div className="flex items-start text-purple-200 p-3 rounded-lg bg-white/5">
                                <StatusIcon className={`w-5 h-5 mr-3 mt-1 ${
                                    ticketStatus.color === 'green' ? 'text-green-400' : 
                                    ticketStatus.color === 'red' ? 'text-red-400' : 
                                    'text-blue-400'
                                } transition-all duration-200`} />
                                <div>
                                    <div className="font-semibold">Status</div>
                                    <div className="text-sm flex items-center">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            ticketStatus.color === 'green' ? 'bg-green-500/20 text-green-300' :
                                            ticketStatus.color === 'red' ? 'bg-red-500/20 text-red-300' :
                                            'bg-blue-500/20 text-blue-300'
                                        }`}>
                                            {ticketStatus.status}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Blockchain Network */}
                            <div className="group flex items-start text-purple-200 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                 onClick={() => copyToClipboard(getNetworkName(chainId), 'Network')}>
                                <ExternalLink className="w-5 h-5 mr-3 mt-1 group-hover:text-purple-100 group-hover:scale-110 transition-all duration-200" />
                                <div>
                                    <div className="font-semibold group-hover:text-white transition-colors duration-200">Blockchain</div>
                                    <div className="text-sm">{getNetworkName(chainId)}{chainId ? ` (${chainId})` : ''}</div>
                                </div>
                                {copiedField === 'Network' && <Copy className="w-4 h-4 ml-auto text-green-400" />}
                            </div>
                        </div>

                        {/* Enhanced Owner Info */}
                        <div className="border-t border-white/20 pt-6 mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2 animate-pulse"></div>
                                Ticket Owner
                            </h3>
                            <div className="group flex items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer"
                                 onClick={() => account && copyToClipboard(account, 'Wallet Address')}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold mr-3 group-hover:scale-110 transition-transform duration-200">
                                    {account?.slice(2, 4).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <div className="text-white font-mono text-sm group-hover:text-purple-200 transition-colors duration-200">
                                        {account?.slice(0, 6)}...{account?.slice(-4)}
                                    </div>
                                    <div className="text-purple-300 text-xs">
                                        {account === ticket.owner ? '✓ You' : 'Another wallet'}
                                    </div>
                                </div>
                                {copiedField === 'Wallet Address' && <Copy className="w-4 h-4 text-green-400" />}
                            </div>
                        </div>

                        {/* Enhanced QR Code Button */}
                        <button
                            onClick={() => setQrOpen(true)}
                            className="group w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-size-200 animate-gradient-x hover:shadow-lg text-white py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center space-x-2"
                        >
                            <Ticket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-200" />
                            <span>Show QR Code</span>
                            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                        </button>
                    </div>
                </div>

                {/* Enhanced QR Code Modal */}
                {qrOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-8 shadow-2xl text-center relative max-w-sm w-full mx-4 transform animate-scale-in">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center justify-center">
                                    <Ticket className="w-6 h-6 mr-2 animate-pulse" />
                                    Ticket QR Code
                                </h2>
                                <div className="flex justify-center mb-6 p-4 bg-white rounded-xl shadow-inner">
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            tokenId: ticket.tokenId,
                                            eventId: ticket.eventId,
                                            owner: ticket.owner,
                                            timestamp: Date.now()
                                        })}
                                        size={200}
                                        className="animate-fade-in"
                                    />
                                </div>
                                <p className="text-gray-600 mb-6 font-medium">Scan this code at the event entrance</p>
                                <button
                                    onClick={() => setQrOpen(false)}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Claim Lucky Draw Modal */}
                {claimModalOpen && ticket?.event && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
                        <div className="bg-white rounded-2xl p-6 shadow-2xl relative max-w-md w-full mx-4 transform animate-scale-in">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold mb-4 text-purple-800 flex items-center">
                                    <Gift className="w-6 h-6 mr-2 animate-bounce" />
                                    Lucky Draw
                                </h2>
                                {!claimResult ? (
                                    <>
                                        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                            <p className="text-gray-700 font-medium">
                                                🎰 You have one chance to join the lucky draw for this event. Ready to test your luck?
                                            </p>
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                className="px-6 py-3 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 font-semibold transition-all duration-300 transform hover:scale-105"
                                                onClick={() => setClaimModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="group px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 text-purple-900 font-semibold hover:from-yellow-300 hover:to-orange-300 transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center"
                                                onClick={async () => {
                                                    if (!ticket?.event) return
                                                    try {
                                                        setLoading(true)
                                                        const claimedNow = await hasClaimedBlindBag(account!, ticket.event.eventId)
                                                        if (claimedNow) {
                                                            setHasClaimed(true)
                                                            toast.error('Already claimed the lucky draw for this event')
                                                            return
                                                        }
                                                        const result = await claimBlindBag(ticket.event.eventId)
                                                        setClaimResult(result)
                                                        setHasClaimed(true)
                                                    } catch (e: any) {
                                                        console.error(e)
                                                    } finally {
                                                        setLoading(false)
                                                    }
                                                }}
                                            >
                                                <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                                                Claim Now!
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="mb-6 text-center">
                                            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                                <CheckCircle className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-green-800 mb-2">🎉 Lucky Draw Complete!</h3>
                                            {typeof claimResult.rewardId === 'number' ? (
                                                <p className="text-gray-700">
                                                    <span className="font-semibold">Congratulations!</span><br/>
                                                    Reward ID: <span className="font-mono bg-green-100 px-2 py-1 rounded">{claimResult.rewardId}</span>
                                                </p>
                                            ) : (
                                                <p className="text-gray-700 font-medium">Claimed successfully! Check your rewards.</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-3 font-mono bg-gray-100 p-2 rounded">
                                                Tx: {claimResult.txHash.slice(0, 10)}...{claimResult.txHash.slice(-8)}
                                            </p>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 active:scale-95"
                                                onClick={() => setClaimModalOpen(false)}
                                            >
                                                Awesome!
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetails;

/* Add these custom CSS animations to your global styles or component styles */
const styles = `
@keyframes gradient-x {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

@keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fade-in-up {
    from { 
        opacity: 0; 
        transform: translateY(10px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

@keyframes slide-in-right {
    from { 
        opacity: 0; 
        transform: translateX(10px); 
    }
    to { 
        opacity: 1; 
        transform: translateX(0); 
    }
}

@keyframes scale-in {
    from { 
        opacity: 0; 
        transform: scale(0.9); 
    }
    to { 
        opacity: 1; 
        transform: scale(1); 
    }
}

.animate-gradient-x {
    animation: gradient-x 3s ease infinite;
}

.bg-size-200 {
    background-size: 200% 200%;
}

.animate-fade-in {
    animation: fade-in 0.5s ease-out;
}

.animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out;
}

.animate-slide-in-right {
    animation: slide-in-right 0.5s ease-out;
}

.animate-scale-in {
    animation: scale-in 0.3s ease-out;
}
`;