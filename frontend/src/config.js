import { defineChain, isAddress } from 'viem'

function requireEnv(name) {
  const value = import.meta.env[name]
  if (!value) {
    throw new Error(`Falta ${name}. Copia .env.example a .env y llénalo.`)
  }
  return value
}

export const PRIVY_APP_ID = requireEnv('VITE_PRIVY_APP_ID')

export const CONTRACT_ADDRESS = requireEnv('VITE_CONTRACT_ADDRESS')
if (!isAddress(CONTRACT_ADDRESS)) {
  throw new Error(`VITE_CONTRACT_ADDRESS no es una dirección válida: ${CONTRACT_ADDRESS}`)
}

export const monadTestnet = defineChain({
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: { name: 'MON', symbol: 'MON', decimals: 18 },
  rpcUrls: { default: { http: ['https://testnet-rpc.monad.xyz'] } },
  blockExplorers: { default: { name: 'Explorer', url: 'https://testnet.monadexplorer.com' } },
  testnet: true,
})

export const FANSLAYER_ABI = [
  {
    name: 'mintArtist',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_name', type: 'string' }],
    outputs: [],
  },
  {
    name: 'mintPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
]
