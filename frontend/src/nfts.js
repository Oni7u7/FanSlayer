import { createPublicClient, http } from 'viem'
import { CONTRACT_ADDRESS, FANSLAYER_ABI, artistByName, monadTestnet } from './config'

export const publicClient = createPublicClient({ chain: monadTestnet, transport: http() })

const contract = { address: CONTRACT_ADDRESS, abi: FANSLAYER_ABI }
const CHUNK = 300

// El contrato no es ERC721Enumerable y el RPC de Monad no permite buscar
// eventos Transfer en todo el historial, así que:
// 1) encontramos cuántos tokens existen (los ids son 0..n-1 y no hay burn),
// 2) leemos ownerOf de todos con multicall y nos quedamos con los del jugador.
async function tokenExists(tokenId) {
  try {
    await publicClient.readContract({ ...contract, functionName: 'ownerOf', args: [BigInt(tokenId)] })
    return true
  } catch {
    return false
  }
}

async function countTokens() {
  // Contratos nuevos exponen totalMinted(); el desplegado originalmente no.
  try {
    const total = await publicClient.readContract({ ...contract, functionName: 'totalMinted' })
    return Number(total)
  } catch {
    // Sin totalMinted: se busca el primer id inexistente.
  }
  if (!(await tokenExists(0))) return 0
  // Búsqueda exponencial y luego binaria del primer id inexistente.
  let lo = 1
  let hi = 2
  while (await tokenExists(hi - 1)) {
    lo = hi
    hi *= 2
  }
  let left = lo
  let right = hi - 1
  while (left < right) {
    const mid = (left + right) >> 1
    if (await tokenExists(mid)) left = mid + 1
    else right = mid
  }
  return left
}

async function multicallChunks(ids, functionName) {
  const results = []
  for (let i = 0; i < ids.length; i += CHUNK) {
    const slice = ids.slice(i, i + CHUNK)
    const res = await publicClient.multicall({
      contracts: slice.map((id) => ({ ...contract, functionName, args: [BigInt(id)] })),
      allowFailure: true,
    })
    results.push(...res)
  }
  return results
}

/**
 * Personajes (NFTs) que tiene `owner`.
 * @returns {Promise<Array<{ tokenId: number, name: string, artist: object|null }>>}
 */
export async function fetchOwnedCharacters(owner) {
  const total = await countTokens()
  if (total === 0) return []

  const ids = Array.from({ length: total }, (_, i) => i)
  const owners = await multicallChunks(ids, 'ownerOf')
  const mine = ids.filter(
    (id, i) => owners[i].status === 'success' && owners[i].result.toLowerCase() === owner.toLowerCase()
  )
  if (mine.length === 0) return []

  const names = await multicallChunks(mine, 'artistName')
  return mine.map((tokenId, i) => {
    const name = names[i].status === 'success' ? names[i].result : ''
    return { tokenId, name, artist: artistByName(name) }
  })
}
