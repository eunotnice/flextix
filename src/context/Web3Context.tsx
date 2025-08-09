import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Add TypeScript declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}

interface Web3ContextType {
  account: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  isConnected: boolean
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  chainId: number | null
  isCorrectNetwork: boolean
  switchToCorrectNetwork: () => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider')
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  // For development, we want to connect to localhost (Hardhat)
  const CORRECT_CHAIN_ID = 31337 // Hardhat localhost

  const checkNetwork = (chainId: number) => {
    const correct = chainId === CORRECT_CHAIN_ID
    setIsCorrectNetwork(correct)
    return correct
  }

  const switchToCorrectNetwork = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${CORRECT_CHAIN_ID.toString(16)}` }],
        })
      }
    } catch (error: any) {
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${CORRECT_CHAIN_ID.toString(16)}`,
              chainName: 'Hardhat Local',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['http://127.0.0.1:8545'],
            }],
          })
        } catch (addError) {
          console.error('Error adding network:', addError)
          toast.error('Failed to add Hardhat network to MetaMask')
        }
      } else {
        console.error('Error switching network:', error)
        toast.error('Failed to switch to Hardhat network')
      }
    }
  }

  const connectWallet = async () => {
    try {
      console.log('=== CONNECT WALLET START ===')
      if (typeof window.ethereum !== 'undefined') {
        console.log('✅ MetaMask is available')
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send('eth_requestAccounts', [])
        const signer = await provider.getSigner()
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)

        console.log('✅ Accounts:', accounts)
        console.log('✅ Signer address:', await signer.getAddress())
        console.log('✅ Chain ID:', chainId)

        setProvider(provider)
        setSigner(signer)
        setAccount(accounts[0])
        setChainId(chainId)
        checkNetwork(chainId)

        if (!checkNetwork(chainId)) {
          console.log('⚠️ Wrong network, prompting switch...')
          toast.error('Please switch to Hardhat Local network (Chain ID: 31337)')
          await switchToCorrectNetwork()
        } else {
          console.log('✅ Connected to correct network')
          toast.success('Wallet connected successfully!')
        }
      } else {
        console.log('❌ MetaMask not available')
        toast.error('Please install MetaMask!')
      }
      console.log('=== CONNECT WALLET END ===')
    } catch (error) {
      console.error('❌ Error connecting wallet:', error)
      toast.error('Failed to connect wallet')
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setProvider(null)
    setSigner(null)
    setChainId(null)
    setIsCorrectNetwork(false)
    toast.success('Wallet disconnected')
  }

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()
        
        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          const chainId = Number(network.chainId)
          
          setProvider(provider)
          setSigner(signer)
          setAccount(accounts[0].address)
          setChainId(chainId)
          checkNetwork(chainId)
        }
      }
    }

    checkConnection()

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
        }
      })

      window.ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16)
        setChainId(newChainId)
        checkNetwork(newChainId)
      })
    }
  }, [])

  return (
    <Web3Context.Provider value={{
      account,
      provider,
      signer,
      isConnected: !!account,
      connectWallet,
      disconnectWallet,
      chainId,
      isCorrectNetwork,
      switchToCorrectNetwork
    }}>
      {children}
    </Web3Context.Provider>
  )
}
