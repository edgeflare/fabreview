# fabreview: Review Network on Hyperledger Fabric blockchain

This PoC is motivated by the fact that [deshimula.com](https://deshimula.com), a review site driven by software developers
in Bangladesh, had to shutdown due possibly pressure from authorities / companies. This got me curious if blockchain finds a use-case.

Visit [https://fabreview.edgeflare.io](https://fabreview.edgeflare.io) to submit or view reviews.
Endusers needn't to care about blockchain jargon (cuz it aint trendy anymore); users login with OIDC IdP eg Keycloak, GitHub, Google, Dex (used here) etc.

The rest of the README is for developers to join (ie host peers of) `fabreview.edgeflare.dev` network as well as for building similar stuff on their own.

## Prerequisites
- [Hyperledge Fabric](https://github.com/hyperledger/fabric) network on [Kubernetes](https://kubernetes.io/). See [edgeflare/helm-charts](https://github.com/edgeflare/helm-charts) 
- kubectl, helm binaries
- Ensure all the peers and orderers have joined a channel eg `default`.

Install chaincode on the channel 

```sh
CC_NAME=fabreviewccv1
helm -n orderer upgrade --install install-$CC_NAME-cc edgeflare/fabric-chaincode \
  --set cc.name=$CC_NAME,cc.channelId=default,cc.image=ghcr.io/edgeflare/fabreview:cc-0.1.0
```

Interact with Fabric network via REST API using [edgeflare/fabric-oidc-proxy](https://github.com/edgeflare/fabric-oidc-proxy).

## Development

### Chaincode

See [fabric-contract-api-go](https://github.com/hyperledger/fabric-contract-api-go) which the [ReviewContract](./chaincode/reviewcc/contract.go) is written with.

### WebUI (Angular)

```sh
cd webui
npm install
npx ng build ng-essential
npx ng serve
# embed serve with go binary
npx ng build
go build .
./webui -port 8080 -embed -spa
```
