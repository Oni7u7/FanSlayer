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
  contracts: {
    multicall3: { address: '0xcA11bde05977b3631167028862bE2a173976CA11' },
  },
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
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'artistName',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    name: 'totalMinted',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'hasArtist',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }, { name: 'name', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
  { name: 'NotEnoughMON', type: 'error', inputs: [] },
  { name: 'UnknownArtist', type: 'error', inputs: [{ name: 'name', type: 'string' }] },
  {
    name: 'ArtistAlreadyOwned',
    type: 'error',
    inputs: [{ name: 'wallet', type: 'address' }, { name: 'name', type: 'string' }],
  },
  {
    name: 'mintPrice',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
]

// Catálogo de personajes. `name` es exactamente el string que se guarda
// on-chain en artistName al mintear; así se reconoce cada NFT. Debe coincidir
// con los artistas registrados en contracts/script/FanSlayer.s.sol.
const spriteSet = (folder) => ({
  idle: [`/sprites/${folder}/img1.jpeg`],
  walk: [`/sprites/${folder}/img2.png`, `/sprites/${folder}/img3.png`, `/sprites/${folder}/img5.png`],
  attack: [`/sprites/${folder}/img6.png`, `/sprites/${folder}/img7.png`],
})

export const ARTISTS = [
  { id: 'badbany', name: 'Bad Bany', image: '/sprites/badbany/img1.jpeg', sprites: spriteSet('badbany') },
  { id: 'michaeljackson', name: 'Michel Jackson', image: '/sprites/michaeljackson/img1.jpeg', sprites: spriteSet('michaeljackson') },
]

const normalize = (name) => name.trim().toLowerCase()
export const artistByName = (name) => ARTISTS.find((a) => normalize(a.name) === normalize(name)) ?? null
