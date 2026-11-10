# FanSlayer

Juego web donde compras artistas como NFT en Monad Testnet y peleas contra zombis con ellos.

| Carpeta | Qué hay |
| --- | --- |
| [`frontend/`](frontend) | React + Vite + Privy. Se despliega en Vercel con Root Directory `frontend`. |
| [`contracts/`](contracts) | Contrato `FanSlayerArtists` (ERC-721) con Foundry. |

## Empezar

```shell
git clone --recurse-submodules https://github.com/Oni7u7/fanslayer.git
cd fanslayer/frontend && cp .env.example .env   # llena los valores
npm install && npm run dev
```

Contratos:

```shell
cd contracts && forge test
```

El `.env` nunca se sube: está en `.gitignore`. En Vercel las variables se configuran en el dashboard del proyecto.
