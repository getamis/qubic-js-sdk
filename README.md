# AMIS Wallet SDK

![Node.js CI](https://github.com/getamis/qubic-js/workflows/Node.js%20CI/badge.svg)
<br />

# Demo

[https://qubic-js-sdk-example.netlify.app/](https://qubic-js-sdk-example.netlify.app/)

# Installation

### React

```cli
$ npm install @qubic-js/react
```

### Javascript

```cli
$ npm install @qubic-js/browser
```

# Usage

### React

```javascript
import Web3 from 'web3';
import { QubicConnector } from '@qubic-js/react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';

const qubicConnector = new QubicConnector(API_KEY, API_SECRET, CHAIN_ID, {
  // optional, default: false, when value is true, the popup will hide automatically
  autoHideWelcome: true
  // optional, default: false, when value is true, the show iframe instead of new window, credit card payment will failed with this option value true
  enableIframe: true
});
const amis = qubicConnector.getClient();

export default () => {
  const context = useWeb3React<Web3>();
  const { account, chainId, activate, library: web3 } = context;

  const handleSignIn = useCallback(async () => {
    activate(qubicConnector, (e: Error): void => {
      console.error(e);
    });
  }, [activate]);

  return (
    <Web3ReactProvider getLibrary={library}>
      <App />
    </Web3ReactProvider>
  );
}
```

### Javascript

```javascript
import Web3 from 'web3';
import AMIS from '@qubic-js/browser';

const amis = new AMIS(API_KEY, API_SECRET, Network.RINKEBY);
amis.setSpeed(Speed.FAST);

const web3 = new Web3(amis.getProvider());
```

## Run Example

```cli
$ git clone git@github.com:getamis/qubic-js.git
$ cd qubic-js
$ yarn example
```

# Features

## 更好的使用者入門體驗

### No Private Key

透過 TSS 技術，使用者無需自行保管私鑰，完整的私鑰也絕對不會出現在網路或任何儲存空間中。

不同於市面上其他替使用者保管私鑰的錢包，AMIS 錢包的使用者依然擁有完全的所有權，即便完整的私鑰不在使用者手中，但沒有使用者的簽名，任一方都無法將使用者的資產轉移。

## 更高的安全性

### HTSS 階層式門檻簽章

透過 AMIS 專利的 HTSS 技術，將私鑰拆分為多組 shares，分別交由使用者、可靠第三方與 AMIS 保管，即便任何一個 share 丟失，使用者的資產也無法被竊取。

若不幸 share 流出，可以透過 reshare 流程作廢舊的 share，重新取回安全的錢包。

# SDK Spec

## Enums & Types

### Network

```javascript
enum Network {
  MAINNET,
  ROPSTEN,
  RINKEBY,
}
```

### Cost

```javascript
type Cost = {
  gasPrice: string,
  wait: number,
};
```

**_Params_**

- `gasPrice`: 估計所需 gas 價格，單位為 `wei`
- `wait`: 等待上鏈時間，單位為 `分鐘`

### CostData

```ts
type CostMap = {
  blockNumber: number;
  blockHash: string;
  [Speed.FASTEST]: Cost;
  [Speed.FAST]: Cost;
  [Speed.AVERAGE]: Cost;
};
```

**_Params_**

- `blockNumber`: 基於該區塊高度去估計所需 `gasPrice`
- `blockHash`: 基於該區塊去估計所需之 `gasPrice`

## Initializer

### constructor

```javascript
constructor(apiKey: string, apiSecret: string, network: Network): AMIS
```

初始化 AMIS 錢包客戶端

**_Params_**

- `apiKey`: 在 AMIS 後台申請 `apiKey`
- `apiSecret`: 在 AMIS 後台申請 `apiSecret`
- `network`: 目前提供 `MAINNET`、`ROPSTEN` 和 `RINKEBY`

**_Return_**

可用於呼叫 amis methods 的物件

## Methods - Basic

串接 AMIS 錢包，包含內建的 Web UI

### getProvider

```javascript
function getProvider(): AMISProvider
```

提供 web3 provider 支援，統一介面減少開發者串接成本，provider 實作會抽換 `signTransaction` 與 `sendTransaction` 等方法以支援 relayer 或 maicoin pay 功能

**_Return_**

回傳 AMIS 自訂的 web3 provider

### signIn

```javascript
function signIn(): void
```

開啟 Social Login 登入流程

### estimateCosts

```javascript
function estimateCosts(): CostData
```

估算 `Fastest`、`Fast` 與 `Average` 等不同速度下所需的 `gasPrice` 與上鏈等待時間

### setSpeed

```javascript
function setSpeed(speed: Speed): void
```

DApp 開發者設定每筆交易的上鏈速度，AMIS 會自動估算最合適的價格

**_Params_**

- `speed`: 上鏈速度，請參考 Speed
