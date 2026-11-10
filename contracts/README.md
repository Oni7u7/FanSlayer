# FanSlayer · Contratos

`FanSlayerArtists` (ERC-721, símbolo `FSART`): cada token es un artista que el jugador compra por `mintPrice` (0.01 MON).

Desplegado en Monad Testnet (chain 10143): `0x4a8EEB3b29527e88D6CDBd93fE39F9DB3aa7064a`

## Uso

```shell
forge build
forge test
forge fmt
```

## Deploy

Usa un keystore cifrado en vez de pasar la llave privada en texto plano:

```shell
cast wallet import deployer --interactive
forge script script/FanSlayer.s.sol:DeployFanSlayer \
  --rpc-url https://testnet-rpc.monad.xyz \
  --account deployer --broadcast
```

Después copia la nueva dirección a `VITE_CONTRACT_ADDRESS` en `frontend/.env`.
