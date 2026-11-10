# FanSlayer · Frontend

React + Vite + Privy, sobre Monad Testnet.

## Configuración

```shell
cp .env.example .env   # y llena los valores
npm install
npm run dev
```

| Variable | Qué es |
| --- | --- |
| `VITE_PRIVY_APP_ID` | App ID del dashboard de Privy |
| `VITE_CONTRACT_ADDRESS` | Dirección de `FanSlayerArtists` |

Todo lo que empieza con `VITE_` termina en el bundle público: no pongas secretos ahí.
La config de la cadena y el ABI viven en `src/config.js`.
