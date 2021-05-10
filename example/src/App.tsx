/* eslint-disable no-console */
import React, { useCallback, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Web3 from 'web3';
import Web3Utils, { AbiItem } from 'web3-utils';
import { TransactionReceipt } from 'web3-core';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';

import { QubicConnector } from '@amis-sdk/react';

const erc20Abi = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'approve',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address',
      },
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address',
      },
      {
        name: '_value',
        type: 'uint256',
      },
    ],
    name: 'transfer',
    outputs: [
      {
        name: '',
        type: 'bool',
      },
    ],
    payable: false,
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address',
      },
      {
        name: '_spender',
        type: 'address',
      },
    ],
    name: 'allowance',
    outputs: [
      {
        name: '',
        type: 'uint256',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    payable: true,
    stateMutability: 'payable',
    type: 'fallback',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        name: 'spender',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Approval',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        name: 'value',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
] as AbiItem[];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3e4b64',
    alignItems: 'center',
    justifyContent: 'center',
  },
  padding: {
    padding: 8,
  },
  button: {
    backgroundColor: 'rgba(20, 0, 0, 0.2)',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  group: {
    paddingBottom: 16,
    width: 300,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
  },
  btnText: {
    color: '#fff',
  },
  addrText: {
    color: '#fff',
    textAlign: 'center',
  },
});

const Button = React.memo<{ children: string; onPress: () => void }>(({ children, onPress }) => (
  <View style={styles.padding}>
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.btnText}>{children}</Text>
    </TouchableOpacity>
  </View>
));

// Lootex API data:
const API_KEY = 'a857a616-21ed-4d9e-9aff-2091993bff73';
const API_SECRET = 'DnAYwfFMCGzdMNMMdTCeLWifJbGYgZFP';
const CHAIN_ID = 4;

const qubicConnector = new QubicConnector(API_KEY, API_SECRET, CHAIN_ID);

const App = React.memo(() => {
  const context = useWeb3React<Web3>();
  const { account, activate, library: web3 } = context;
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    console.log('account', account);
    setAddress(account || '');
  }, [account]);

  const handleSignInUp = useCallback(() => {
    activate(qubicConnector, (e: Error): void => {
      console.error(e);
    });
  }, [activate]);

  const handleEstimateGas = useCallback(() => {
    web3?.eth.estimateGas(
      {
        from: '0x6c8d905b6480D32fF2E7A46B3325a6dE912a553b',
        to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
        gas: '0x76c0',
        gasPrice: '0x9184e72a000',
        value: '0x9184e72a',
        data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
      },
      (error, gas) => {
        console.log(`gas=${gas}`);
      },
    );
  }, [Boolean(web3)]);

  const handleEstimateCosts = useCallback(async () => {
    const amis = qubicConnector.getClient();
    const result = await amis?.estimateCosts();
    console.log('estimated costs', result);
  }, []);

  const handleSend = useCallback(async () => {
    const tx = {
      // this could be provider.addresses[0] if it exists
      from: account || '',
      // target address, this could be a smart contract address
      to: '0xdd2c45b296C218779783c9AAF9f876391FA9aF53',
      // optional if you want to specify the gas limit
      gasLimit: 21000,
      // optional if you are invoking say a payable function
      value: Web3Utils.toWei('0.0001'),
    };

    web3?.eth
      .sendTransaction(tx, (error, hash) => {
        if (error) console.error(error);
        else console.log('tx hash:', hash);
      })
      .once('transactionHash', hash => {
        console.log('transactionHash:', hash);
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation:', confirmationNumber, receipt);
      })
      .on('error', error => {
        console.error(error);
      })
      .then(receipt => {
        console.log('receipt:', receipt);
      });
  }, [account, web3]);

  const handleGetERC20 = useCallback(async () => {
    const tx = {
      // this could be provider.addresses[0] if it exists
      from: account || '',
      to: '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c', // Xeenus
      // optional if you want to specify the gas limit
      gas: 60000,
      // optional if you are invoking say a payable function
      value: web3?.utils.toWei('0'),
      // call fallback
      data: '0xdeadbeef',
    };

    web3?.eth
      .sendTransaction(tx, (error, hash) => {
        if (error) console.error(error);
        else console.log('tx hash:', hash);
      })
      .once('transactionHash', hash => {
        console.log('transactionHash:', hash);
      })
      .once('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation:', confirmationNumber, receipt);
      })
      .on('error', error => {
        console.error(error);
      })
      .then(receipt => {
        console.log('receipt:', receipt);
      });
  }, [account, web3]);

  const handleSendERC20 = useCallback(async () => {
    if (!web3) return;

    const contractAddress = '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c'; // Xeenus
    const xeenusContract = new web3.eth.Contract(erc20Abi, contractAddress);

    const toAddress = '0xdd2c45b296C218779783c9AAF9f876391FA9aF53';
    // Calculate contract compatible value for approve with proper decimal points using BigNumber
    const tokenDecimals = Web3Utils.toBN(18);
    const tokenAmountToApprove = Web3Utils.toBN(10);
    const amount = Web3Utils.toHex(tokenAmountToApprove.mul(Web3Utils.toBN(10).pow(tokenDecimals)));

    // call transfer function
    xeenusContract.methods
      .transfer(toAddress, amount)
      .send({
        from: account || '', // default from address
        value: 0,
        gas: 100000,
      })
      .on('error', (error: Error): void => {
        console.error(error);
      })
      .once('transactionHash', (hash: string) => {
        console.log(hash);
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        console.log(receipt);
      });
  }, [account, web3]);

  const productPrice = '0.001'; // ETH

  const handleFiatSend = useCallback(async () => {
    const tx = {
      from: account || '',
      // to: '0x702f271affa40d8f5526bff19f0596f52b42b044', // Lootex
      to: '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c',
      // optional if you want to specify the gas limit
      gas: 60000,
      // optional if you are invoking say a payable function
      value: '0',
      // call fallback
      data: '0xdeadbeef',
      // payment
      payment: {
        product: {
          description: 'SANDBOX LAND(110,-167)\nXXXXXXXXXXXXXXXXXXX',
          price: productPrice,
          currency: 'ETH',
        },
        billing: {
          method: 'creditCard',
          currency: 'TWD',
        },
      },
    };

    web3?.eth
      .sendTransaction(tx, (error, hash) => {
        if (error) console.error(error);
        else console.log('tx hash:', hash);
      })
      .once('transactionHash', hash => {
        console.log('transactionHash:', hash);
      })
      .once('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation:', confirmationNumber, receipt);
      })
      .on('error', error => {
        console.error(error);
      })
      .then(receipt => {
        console.log('receipt:', receipt);
      });
  }, [account, Boolean(web3)]);

  const handleSignSign = useCallback(
    async (signer: (data: string) => Promise<string>) => {
      const data = '0xc9b8e1f1df93f7535e849d70806b546555549da9a6c2ae38ba674bf2db1a5817';

      const signature = await signer(data);
      // const signature = await web3.eth.personal.sign(data, addr, 'xxxxxx');
      console.log(`signature=${signature}`);

      // The signer should always be the proxy owner
      const signerAddress = web3?.eth.accounts.recover(data, signature);
      console.log(`signerAddress=${signerAddress}`);
    },
    [web3],
  );

  const handlePersonalSign = useCallback(async () => {
    await handleSignSign(async data => {
      return web3?.eth.personal.sign(data, account || '', 'test password!') || '';
    });
  }, [web3, account, handleSignSign]);

  const handleEthSignTypedData = useCallback(async () => {
    await handleSignSign(async data => {
      return (await web3?.eth.sign(data, account || '')) || '';
    });
  }, [web3, account, handleSignSign]);

  return (
    <View style={styles.container}>
      <View style={styles.group}>
        <Text style={styles.title}>1. 註冊或登錄以獲得地址</Text>
        <Button onPress={handleSignInUp}>SIGN IN / SIGN UP</Button>
        <Text style={styles.addrText}>{address}</Text>
      </View>
      <View style={styles.group}>
        <Text style={styles.title}>2. 估算 Gas Price (顯示在 console 中)</Text>
        <Button onPress={handleEstimateGas}>Estimate Gas</Button>
        <Button onPress={handleEstimateCosts}>Estimate Costs</Button>
      </View>
      <View style={styles.group}>
        <Text style={styles.title}>3. ETH 交易，須先有 ETH</Text>
        <Button onPress={handleSend}>Send Transaction</Button>
      </View>
      <View style={styles.group}>
        <Text style={styles.title}>4. ERC-20 交易</Text>
        <Button onPress={handleGetERC20}>Get Test ERC-20 Token</Button>
        <Button onPress={handleSendERC20}>Send Test ERC-20 Token</Button>
      </View>
      <View style={styles.group}>
        <Text style={styles.title}>5. 透過信用卡購買 NFT</Text>
        <Button onPress={handleFiatSend}>{`Buy something ${productPrice} ETH with TWD`}</Button>
      </View>
      <View style={styles.group}>
        <Text style={styles.title}>6. 簽名</Text>
        <Button onPress={handlePersonalSign}>personal_sign</Button>
        <Button onPress={handleEthSignTypedData}>eth_signTypedData</Button>
      </View>

      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="auto" />
    </View>
  );
});

export default React.memo(() => {
  const library = (provider: any): Web3 => {
    return new Web3(provider);
  };

  return (
    <Web3ReactProvider getLibrary={library}>
      <App />
    </Web3ReactProvider>
  );
});
