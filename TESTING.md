# Testing on testnet

## Creating a gift wallet

[Download node-funder](https://github.com/ethersphere/node-funder) which will be used to create gift wallets.

Make sure your Go version is 1.18 or above. Run `go version` to verify.

Set some environment variables:

```bash
export TESTNET_PRIVATE_KEY="..."
export TESTNET_RPC_ENDPOINT="https://goerli.infura.io/v3/..."
export NODE_FUNDER_PATH="<path to node-funder>"
```

Make sure you have the latest utility CLI version: `npm install --global cafe-tui`

Create a gift wallet with the command `npx cafe-tui funder gift` and make notes as it is not stored anywhere.

## Switching Bee to testnet

Overwrite the following values in `config.yaml` which is at `~/Library/Application Support/Swarm Desktop`:

```yaml
mainnet: false
data-dir: 'data-dir-testnet'
swap-enable: false
swap-endpoint: ''
resolver-options: 'https://goerli.infura.io/v3/...'
bootnode: '/dnsaddr/testnet.ethswarm.org
```

## Getting new Bee

Download the Bee binary under test from the [releases page](https://github.com/ethersphere/bee/releases)

Rename it to `bee` and move it to `~/Library/Application Support/Swarm Desktop`

## Running Desktop

Grab `swarm-desktop` source and run the following:

```bash
cd ui && npm install
cd .. && npm install
npm start
```

## Switching Dashboard to testnet

Grab `bee-dashboard` source and switch to branch `chore/testnet`. It contains the testnet `BZZ_TOKEN_ADDRESS` and
`NETWORK_ID`.

Start it with `REACT_APP_BEE_DESKTOP_URL=http://localhost:3054 REACT_APP_BEE_DESKTOP_ENABLED=true npm start`

Open URL `http://localhost:3002/?v=YOUR_API_KEY` with your Desktop API key. You may use the following command on OSX:

```bash
open "http://localhost:3002/?v=$(cat ~/Library/Application\ Support/Swarm\ Desktop/api-key.txt)"
```
