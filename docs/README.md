# Qubic SDK

## Demo

[https://qubic-js-sdk-example.netlify.app/](https://qubic-js-sdk-example.netlify.app/)

## Getting started

### Installation

#### React

```shell
npm install @qubic-js/react
```

#### Javascript

```shell
npm install @qubic-js/browser
```

### Usage

These are the network names we recognize along with their corresponding chain IDs.
```javascript
enum KnownNetwork {
  MAINNET = 1,
  HOODI = 560048,
  POLYGON = 137,
  AMOY = 80002,
  BSC = 56,
  BSC_TESTNET = 97,
  ARBITRUM = 42161,
  ARBITRUM_SEPOLIA = 421614,
}
```

#### Graphql NetworkInfo

Init graphql client at the start of your project
```javascript
import { initGraphqlClient } from '@qubic-js/core';
initGraphqlClient({
  apiKey: 'example-api-key',
  apiSecret: 'example-api-secret',
  apiUri: 'example-api-uri',
});
```

then you are free to access network (chain) related data from api

```javascript
import { getNetworkInfo, getAllNetworkInfo, checkIsNetworkSupported } from '@qubic-js/core';
const networkInfo = await getNetworkInfo(1);
const allNetworkInfo = await getAllNetworkInfo();
const isNetworkSupported = await checkIsNetworkSupported(1)
```

#### Provider and Connector Options

```javascript
const options {
  // deprecated
  // we now get corresponding rpc from chains api
  infuraProjectId: INFURA_PROJECT_ID,

  // optional, you can contact us to apply for higher rate limit
  // apiKey: API_KEY,

  // optional, you can contact us to apply for higher rate limit
  // apiSecret: API_SECRET,

  // optional, default is mainnet 1
  chainId: CHAIN_ID,

  // optional, default is `https://wallet.qubic.app/`
  walletUrl: 'https://wallet.qubic.app/',

  // optional, default: false, when value is true, the show iframe instead of new window, credit card payment will failed with this option value true
  enableIframe: true

  // === QubicConnector Only options ===
  // optional, default: false, when value is true, the popup will hide automatically
  autoHideWelcome: true

  // optional, default: false, when value is true, signUp actions from sdk will
  // create a account that will force password setting
  disableFastSignup: true

   // optional, default: false, when value is true will not show in app browser warning
  disableIabWarning: true

  // optional, default: false, when value is true will not auto open external browser in line iab
  disableOpenExternalBrowserWhenLineIab
}
```

#### Web3 React

qubicWalletConnector.tsx

```tsx
import { initializeConnector } from '@web3-react/core';
import QubicWalletConnector from '@qubic-js/react';

// please check Connector and Provider Options section
// You should only new only once in your application
const qubicWalletConnector = initializeConnector<QubicWalletConnector>(
  actions =>
    new QubicWalletConnector({
      actions,
      options: {
        chainId,
        autoHideWelcome,
        enableIframe,
      },
    }),
);

export default qubicWalletConnector;
```

App.tsx

```tsx
import Main from './Main.tsx';
import qubicWalletConnector from './qubicWalletConnector';
import { Web3ReactProvider } from '@web3-react/core';

export default function App() {
  return (
    <Web3ReactProvider connectors={[qubicWalletConnector]}>
      <Main />
    </Web3ReactProvider>
  );
}
```

Main.tsx

```tsx
import { SignInProvider } from '@qubic-js/core';
import { useWeb3React } from '@web3-react/core';
import qubicWalletConnector from './qubicWalletConnector';

import options from './options';

export default function Main() {
  const { hooks } = useWeb3React();
  const { usePriorityAccounts, usePriorityProvider, usePriorityChainId } = hooks;

  const handleSignIn = useCallback(async () => {
    qubicWalletConnector.activate(qubicConnector, (e: Error): void => {
      console.error(e);
    });
  }, [activate]);

  const handleGoogleSignIn = useCallback(async () => {
    // will sign in Qubic wallet with Google
    qubicWalletConnector.setSignInProvider(SignInProvider.GOOGLE);
    qubicWalletConnector.activate(qubicConnector, (e: Error): void => {
      console.error(e);
    });
  }, [activate]);

  return (
    <Web3ReactProvider connectors={library}>
      <button onClick={handleSignIn}>Qubic Wallet</button>
      <button onClick={handleSignIn}>Qubic Wallet - Google </button>
    </Web3ReactProvider>
  );
}
```

#### Javascript

```javascript
import { ethers } from 'ethers';
import QubicProvider from '@qubic-js/browser';
import options from './options';

// please check Connector and Provider Options section
// You should only new only once in your application
const qubicProvider = new QubicProvider(options);

const provider = new ethers.providers.Web3Provider(qubicProvider);
```

#### RPC APIs

##### eth_requestAccounts

Requests that the user provides an account to login. Returns a Promise that resolves to an array of a single Ethereum address string. If the user denies the request, the Promise will reject with a 4001 error.

```javascript
provider.request({ method: 'eth_requestAccounts' });
```

## Run Example

```cli
git clone git@github.com:getamis/qubic-js.git
cd qubic-js && yarn
cd example && yarn
yarn example
```

## Qubic Meta-transaction Standard

Coming
