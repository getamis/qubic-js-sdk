import React, { useCallback, useState, useEffect } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import Web3Utils, { toChecksumAddress } from 'web3-utils';
import { AbstractProvider, TransactionReceipt } from 'web3-core';
import { useWeb3React } from '@web3-react/core';
// eslint-disable-next-line camelcase
import { recoverPersonalSignature, recoverTypedSignature, recoverTypedSignature_v4 } from 'eth-sig-util';
import { QubicConnector } from '@qubic-js/react';
import { SignInProvider } from '@qubic-js/core';
import qs from 'query-string';
import { v4 as uuidv4 } from 'uuid';

import { ERC20_ABI, ERC721_ABI } from './abi';
import { Network } from '@qubic-js/core';

const { REACT_APP_INFURA_NETWORK_KEY } = process.env as any;

const INFURA_PROJECT_ID = REACT_APP_INFURA_NETWORK_KEY;

const parsed = qs.parse(window.location.search);

const enableIframe = parsed.enableIframe === 'true';

const qubicConnector = new QubicConnector({
  chainId: Number(parsed.chainId) || 1,
  infuraProjectId: INFURA_PROJECT_ID,
  autoHideWelcome: parsed.autoHideWelcome === 'true' || false,
  enableIframe,
  inAppHintLink: 'https://www.google.com',
});

function App() {
  const context = useWeb3React<Web3>();
  const { account, activate, deactivate, library: web3, chainId } = context;
  const [enableSignMsgAfterActivate, setEnableSignMsgAfterActivate] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [network, setNetwork] = useState('');

  useEffect(() => {
    console.log('network', chainId);
    setNetwork(chainId?.toString() || '');
  }, [chainId]);

  useEffect(() => {
    console.log('account', account);
    setAddress(account || '');
  }, [account]);

  useEffect(() => {
    const currentProvider = web3?.currentProvider as AbstractProvider | undefined;
    if (!currentProvider) return;
    const onAccountsChanged = (accounts: string[]) => {
      console.log('accountsChanged', accounts);
    };
    (currentProvider as any).on('accountsChanged', onAccountsChanged);
    return () => {
      (currentProvider as any).off('accountsChanged', onAccountsChanged);
    };
  }, [web3]);

  useEffect(() => {
    const currentProvider = web3?.currentProvider as AbstractProvider | undefined;

    if (enableSignMsgAfterActivate && address && currentProvider?.request) {
      setEnableSignMsgAfterActivate(false);

      const from = address;

      currentProvider
        .request({
          jsonrpc: '2.0',
          method: 'qubic_login',
          params: [
            from,
            JSON.stringify({
              name: 'OneOffs',
              url: 'https://nft.oneoffs.art',
              permissions: [
                'wallet.permission.access_email_address',
                // 'wallet.permission.access_profile_image',
                // 'wallet.permission.access_language_preference',
                // 'wallet.permission.access_phone_number',
              ],
              nonce: '163849628497268',
              service: 'qubee-creator',
            }),
          ],
        })
        .then(signature => {
          console.log('handleSignInUpAndSignMessage 2');
          console.log(`signature=${signature}`);
        })
        .catch(console.error);
    }
  }, [address, enableSignMsgAfterActivate, web3?.currentProvider]);

  const handleSignInUp = useCallback(() => {
    activate(qubicConnector, (e: Error): void => {
      console.error(e);
    });
  }, [activate]);

  const bindSignInUpWithSignInProvider = useCallback(
    (signInProvider: SignInProvider) => () => {
      qubicConnector.setSignInProvider(signInProvider);
      activate(qubicConnector, (e: Error): void => {
        console.error(e);
      });
    },
    [activate],
  );

  const handleSignInUpAndSignMessage = useCallback(async () => {
    setEnableSignMsgAfterActivate(true);
    await activate(qubicConnector, (e: Error): void => {
      console.error(e);
    });
  }, [activate]);

  const handleDisconnect = useCallback(() => {
    deactivate();
  }, [deactivate]);

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
      (_, gas) => {
        console.log(`gas=${gas}`);
      },
    );
  }, [web3?.eth]);

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
      .sendTransaction(tx, (sendError, hash) => {
        if (sendError) console.error(sendError);
        else console.log('tx hash:', hash);
      })
      .once('transactionHash', hash => {
        console.log('transactionHash:', hash);
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation:', confirmationNumber, receipt);
      })
      .then(receipt => {
        console.log('receipt:', receipt);
      })
      .catch(() => {
        // if you use then, than you have to use catch
        // already handle in sendTransaction(tx, (error, hash)
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
      .sendTransaction(tx, (getERCError, hash) => {
        if (getERCError) console.error(getERCError);
        else console.log('tx hash:', hash);
      })
      .once('transactionHash', hash => {
        console.log('transactionHash:', hash);
      })
      .once('confirmation', (confirmationNumber, receipt) => {
        console.log('confirmation:', confirmationNumber, receipt);
      })
      .then(receipt => {
        console.log('receipt:', receipt);
      })
      .catch(() => {
        // if you use then, than you have to use catch
        // already handle in sendTransaction(tx, (error, hash)
      });
  }, [account, web3]);

  const handleSendERC20 = useCallback(async () => {
    if (!web3) return;

    const contractAddress = '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c'; // Xeenus
    const xeenusContract = new web3.eth.Contract(ERC20_ABI, contractAddress);

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
      .on('error', (contractError: Error): void => {
        console.error(contractError);
      })
      .once('transactionHash', (hash: string) => {
        console.log(hash);
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        console.log(receipt);
      });
  }, [account, web3]);

  const handleApproveERC20 = useCallback(async () => {
    if (!web3) return;
    const spender = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'; // spender: dapp uniswap smart contract address
    const tokenDecimals = Web3Utils.toBN(18);
    const tokenAmountToApprove = Web3Utils.toBN(1);
    const amount = Web3Utils.toHex(tokenAmountToApprove.mul(Web3Utils.toBN(10).pow(tokenDecimals)));
    const contractAddress = '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c'; // Xeenus
    const xeenusContract = new web3.eth.Contract(ERC20_ABI, contractAddress);
    xeenusContract.methods
      .approve(spender, amount)
      .send({
        from: account || '', // default from address
        value: 0,
        gas: 100000,
      })
      .on('error', (approveError: Error): void => {
        console.error(approveError);
      })
      .once('transactionHash', (hash: string) => {
        console.log(hash);
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        console.log(receipt);
      });
  }, [account, web3]);

  const handleSignSign = useCallback(
    async (data: string, signer: () => Promise<string>) => {
      try {
        const signature = await signer();
        // const signature = await web3.eth.personal.sign(data, addr, 'xxxxxx');
        console.log(`signature=${signature}`);

        // The signer should always be the proxy owner
        const signerAddress = web3?.eth.accounts.recover(data, signature);
        console.log(`signerAddress=${signerAddress}`);
      } catch (err) {
        const { code, message, stack } = err as any;
        console.error({
          code,
          message,
          stack,
        });
      }
    },
    [web3],
  );

  const handleSkipPreviewSign = useCallback(async () => {
    const from = address;
    const createdAt = Math.floor(new Date().getTime() / 1000);

    const requestId = uuidv4();

    const msgParams = {
      requestId,
      userAddress: address,
      customData: '{"test":"hello?","messageA":[1,4,6],"messageB":500}',
      webhookUrl: 'https://qubic-pass-demo.herokuapp.com/api/hook',
      createdAt,
    };

    const toBeSigned = JSON.stringify(msgParams);

    const payload = {
      jsonrpc: '2.0',
      method: 'qubic_skipPreviewSign',
      params: [toBeSigned, account],
    };

    function qubicSignSkipPreview() {
      return new Promise<string>((resolve, reject) => {
        (web3?.currentProvider as AbstractProvider).sendAsync(payload, (skipPreviewSignError, response) => {
          if (skipPreviewSignError) {
            reject(skipPreviewSignError);
          } else {
            resolve(response?.result);
          }
        });
      });
    }

    const signature = (await qubicSignSkipPreview()) || '';

    const recoveredAddr = recoverPersonalSignature({
      data: msgParams as any,
      sig: signature,
    });

    if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
      console.log(`Successfully verified signer as ${recoveredAddr}`);
    } else {
      console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`);
    }
  }, [account, address, web3?.currentProvider]);

  const handleSkipPreviewSignTypedData = useCallback(async () => {
    const from = address;

    const toBeSigned =
      '{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"ForwardRequest":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"},{"name":"gas","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"data","type":"bytes"}]},"primaryType":"ForwardRequest","domain":{"name":"GenericForwarderV2","version":"0.0.1","chainId":"0x4","verifyingContract":"0xDA09Ac0B1edDc502D2ca5F851516d32657Cf32c8","salt":""},"message":{"data":"0xb88d4fde00000000000000000000000046196bc1c0ef858f2f4034ee7e6121823a94b9000000000000000000000000002cb03697c0eb0a5a3cf5f23051c961962bb3c912000000000000000000000000000000000000000000000000000000000000004b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000009d75f848328b25df36873e41ec5d79a9b10316f6000000000000000000000000000000000000000000000000000000000000004b000000000000000000000000435792217934f5704c9105561dbb1939a2373b680000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000006343dfab000000000000000000000000000000000000000000000000000000000000001ba5ca7b2e3df628a2814975546274f5d2fea14e7f89166f5fc55ba29281a3438d21ab25033a44d0bb7253c472f2c3223454dac57ec5cbbf10433805c74cda83000000000000000000000000000000000000000000000000000000000000000044bcbd92e00000000000000000000000009d75f848328b25df36873e41ec5d79a9b10316f6000000000000000000000000000000000000000000000000000000000000004b00000000000000000000000000000000000000000000000000000000","from":"0x46196Bc1C0Ef858f2F4034ee7e6121823A94B900","gas":"152143","nonce":"115792089237316195423570985008687907853269984665640564039457584007913129639935","to":"0x9D75f848328b25df36873E41eC5d79a9b10316f6","value":"0"}}';

    const payload = {
      jsonrpc: '2.0',
      method: 'qubic_skipPreviewSignTypedData',
      params: [account, toBeSigned],
    };

    function qubicSignSkipPreview() {
      return new Promise<string>((resolve, reject) => {
        (web3?.currentProvider as AbstractProvider).sendAsync(payload, (skipPreviewSignError, response) => {
          if (skipPreviewSignError) {
            reject(skipPreviewSignError);
          } else {
            resolve(response?.result);
          }
        });
      });
    }

    const signature = (await qubicSignSkipPreview()) || '';

    const msgParams = JSON.parse(toBeSigned);

    const recoveredAddr = recoverTypedSignature_v4({
      data: msgParams as any,
      sig: signature,
    });

    if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
      console.log(`Successfully verified signer as ${recoveredAddr}`);
    } else {
      console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`);
    }
  }, [account, address, web3?.currentProvider]);

  const handlePersonalSign = useCallback(async () => {
    const data = `0x${Buffer.from('example message', 'utf8').toString('hex')}`;
    await handleSignSign(data, async () => {
      return (await web3?.eth.personal.sign(data, account || '', 'test password!')) || '';
    });
  }, [handleSignSign, web3?.eth.personal, account]);

  const handlePersonalSignUnknownEncoding = useCallback(async () => {
    const data = `0xb073a86cd7e07dc4c222a7b4c489149c627684842c74b7dab99a2f99ceb46249`;
    await handleSignSign(data, async () => {
      return (await web3?.eth.personal.sign(data, account || '', 'test password!')) || '';
    });
  }, [handleSignSign, web3?.eth.personal, account]);

  const handleEthSign = useCallback(async () => {
    const data = '0xc9b8e1f1df93f7535e849d70806b546555549da9a6c2ae38ba674bf2db1a5817';
    await handleSignSign(data, async () => {
      return (await web3?.eth.sign(data, account || '')) || '';
    });
  }, [web3, account, handleSignSign]);

  const handleSignTypedDataV3 = useCallback(async () => {
    const from = address;
    const msgParams = {
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId,
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        sender: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        recipient: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    };

    function ethSignTypedDataV3() {
      return new Promise<string>((resolve, reject) => {
        (web3?.currentProvider as AbstractProvider).sendAsync(
          {
            jsonrpc: '2.0',
            method: 'eth_signTypedData_v3',
            params: [from, JSON.stringify(msgParams)],
          },
          (ethSignTypedDataError, response) => {
            if (ethSignTypedDataError) {
              reject(ethSignTypedDataError);
            } else {
              resolve(response?.result);
            }
          },
        );
      });
    }

    const signature = (await ethSignTypedDataV3()) || '';

    const recoveredAddr = recoverTypedSignature({
      data: msgParams as any,
      sig: signature,
    });
    if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
      console.log(`Successfully verified signer as ${recoveredAddr}`);
    } else {
      console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`);
    }
  }, [address, chainId, web3?.currentProvider]);

  const handleSignTypedDataV4 = useCallback(async () => {
    const from = address;
    const msgParams = {
      domain: {
        chainId,
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: ['0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826', '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF'],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: 'name', type: 'string' },
          { name: 'version', type: 'string' },
          { name: 'chainId', type: 'uint256' },
          { name: 'verifyingContract', type: 'address' },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      },
    };

    function ethSignTypedDataV4() {
      return new Promise<string>((resolve, reject) => {
        (web3?.currentProvider as AbstractProvider).sendAsync(
          {
            jsonrpc: '2.0',
            method: 'eth_signTypedData_v4',
            params: [from, JSON.stringify(msgParams)],
          },
          (ethSignTypedDataV4Error, response) => {
            if (ethSignTypedDataV4Error) {
              reject(ethSignTypedDataV4Error);
            } else {
              resolve(response?.result);
            }
          },
        );
      });
    }

    const signature = (await ethSignTypedDataV4()) || '';

    const recoveredAddr = recoverTypedSignature_v4({
      data: msgParams as any,
      sig: signature,
    });

    if (toChecksumAddress(recoveredAddr) === toChecksumAddress(from)) {
      console.log(`Successfully verified signer as ${recoveredAddr}`);
    } else {
      console.log(`Failed to verify signer when comparing ${recoveredAddr} to ${from}`);
    }
  }, [address, chainId, web3?.currentProvider]);

  const bindOperateEthereumChain = useCallback(
    (method: 'wallet_addEthereumChain' | 'wallet_switchEthereumChain') => () => {
      // eslint-disable-next-line no-alert
      const answer = window.prompt(`What's you chain id?`);
      if (answer === null) {
        return;
      }
      const nextChainId = Number(answer);
      (web3?.currentProvider as AbstractProvider).sendAsync(
        {
          jsonrpc: '2.0',
          method,
          params: [
            {
              chainId: `0x${nextChainId.toString(16)}`,
            },
          ],
        },
        (bindOperateEthereumChainError, response) => {
          if (bindOperateEthereumChainError) {
            console.error(bindOperateEthereumChainError);
          } else {
            console.log(response?.result);
          }
        },
      );
    },
    [web3?.currentProvider],
  );

  const handleGetAccounts = useCallback(() => {
    web3?.eth.getAccounts().then(accounts => {
      console.log({ accounts });
    });
  }, [web3?.eth]);

  const handleCustomRpcRequest = useCallback(() => {
    // eslint-disable-next-line no-alert
    const answer = window.prompt('paste json rpc request');
    try {
      if (answer) {
        const rpcJson = JSON.parse(answer);
        (web3?.currentProvider as AbstractProvider).sendAsync(rpcJson, (customRpcError, response) => {
          if (customRpcError) {
            throw customRpcError;
          } else {
            console.log(response?.result);
          }
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [web3?.currentProvider]);

  const handleQubicIdentityToken = useCallback(() => {
    // eslint-disable-next-line no-alert
    try {
      (web3?.currentProvider as AbstractProvider).sendAsync(
        {
          jsonrpc: '2.0',
          method: 'qubic_issueIdentityTicket',
          params: [],
        },
        (customRpcError, response) => {
          if (customRpcError) {
            throw customRpcError;
          } else {
            const [ticket, expiredAt] = response?.result || [];
            console.log({
              ticket,
              expiredAt,
            });
          }
        },
      );
    } catch (error) {
      console.error(error);
    }
  }, [web3?.currentProvider]);

  const handlePopupBlockedByBrowser = useCallback(async () => {
    // eslint-disable-next-line no-alert
    try {
      // wait a little time to trigger browser block popup window
      const ref = window.open(
        'https://www.google.com',
        '_blank',
        'location=no,resizable=yes,scrollbars=yes,status=yes,height=100,width=100',
      );
      ref?.close();
      (web3?.currentProvider as AbstractProvider).sendAsync(
        {
          jsonrpc: '2.0',
          method: 'eth_requestAccounts',
          params: [],
        },
        (customRpcError, response) => {
          if (customRpcError) {
            throw customRpcError;
          } else {
            console.log(response);
          }
        },
      );
    } catch (error) {
      console.error(error);
    }
  }, [web3?.currentProvider]);

  const handleNftMint = useCallback(
    (options: { targetNetwork: Network; contractAddress: string }) => {
      if (!web3 || !account) return;
      const { targetNetwork, contractAddress } = options;

      if (chainId !== targetNetwork) {
        window.alert(`Network should be chain id: ${targetNetwork}`);
        return;
      }
      const mineTestContract = new web3.eth.Contract(ERC721_ABI, contractAddress);
      mineTestContract.methods
        .mint(account)
        .send({ from: account })
        .on('error', (mintError: Error): void => {
          console.error(mintError);
        })
        .once('transactionHash', (hash: string) => {
          console.log(hash);
        })
        .once('receipt', (receipt: TransactionReceipt) => {
          console.log(receipt);
        });
    },
    [account, chainId, web3],
  );

  // TODO: should update contractAddress when new contract deploy
  const handleGoerliMint = useCallback(async () => {
    handleNftMint({
      targetNetwork: Network.GOERLI,
      contractAddress: '0xC730b891F4FF8b659ab4Fc8D362239907cb99c17',
    });
  }, [handleNftMint]);

  const handleBscTestnetMint = useCallback(async () => {
    handleNftMint({
      targetNetwork: Network.BSC_TESTNET,
      contractAddress: '0x0538563144E2E85A65CB6c8C245936F29604A361',
    });
  }, [handleNftMint]);

  const handleTransfer721 = useCallback(async () => {
    if (!web3 || !account) return;

    const contractAddress = window.prompt('NFT contract address');
    if (!contractAddress) return;
    const tokenId = window.prompt('NFT token id');
    if (!tokenId) return;
    const toAddress = window.prompt('To address');
    if (!toAddress) return;

    const mineTestContract = new web3.eth.Contract(ERC721_ABI, contractAddress);
    mineTestContract.methods
      .safeTransferFrom(account, toAddress, tokenId)
      .send({ from: account })
      .on('error', (mintError: Error): void => {
        console.error(mintError);
      })
      .once('transactionHash', (hash: string) => {
        console.log(hash);
      })
      .once('receipt', (receipt: TransactionReceipt) => {
        console.log(receipt);
      });
  }, [account, web3]);

  return (
    <Container>
      <Wrapper>
        <Group>
          <Title>1. 註冊或登錄以獲得地址</Title>
          <Button onClick={handleSignInUp}>SIGN IN / SIGN UP</Button>

          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.GOOGLE)}>google</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.FACEBOOK)}>facebook</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.APPLE)}>apple</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.YAHOO)}>yahoo</Button>

          <Button onClick={handleSignInUpAndSignMessage}>{`SIGN IN / SIGN UP\nAnd Sign custom message`}</Button>
          <Button onClick={handleQubicIdentityToken}>qubic_issueIdentityTicket</Button>
          {!!address && <InfoText>address: {address}</InfoText>}
          {!!network && <InfoText>network: {network}</InfoText>}
          <Button onClick={handleDisconnect}>Disconnect</Button>
        </Group>
        <Group>
          <Title>2. 估算 Gas Price (顯示在 console 中)</Title>
          <Button onClick={handleEstimateGas}>Estimate Gas</Button>
        </Group>
        <Group>
          <Title>3. ETH 交易，須先有 ETH</Title>
          <Button onClick={handleSend}>Send Transaction</Button>
        </Group>
        <Group>
          <Title>4. ERC-20 交易</Title>
          <Button onClick={handleGetERC20}>Get Test ERC-20 Token</Button>
          <Button onClick={handleSendERC20}>Send Test ERC-20 Token</Button>
          <Button onClick={handleApproveERC20}>Approve Test ERC-20 Token</Button>
        </Group>
        <Group>
          <Title>5. 簽名</Title>
          <Button onClick={handleSkipPreviewSign}>qubic_skipPreviewSign</Button>
          <Button onClick={handleSkipPreviewSignTypedData}>qubic_skipPreviewSignTypedData</Button>
          <Button onClick={handlePersonalSign}>personal_sign</Button>
          <Button onClick={handlePersonalSignUnknownEncoding}>personal_sign_unknown_encoding</Button>
          <Button onClick={handleEthSign}>eth_sign</Button>
          <Button onClick={handleSignTypedDataV3}>eth_signTypedData_v3</Button>
          <Button onClick={handleSignTypedDataV4}>eth_signTypedData_v4</Button>
        </Group>
        <Group>
          <Title>6. chain</Title>
          <Button onClick={bindOperateEthereumChain('wallet_switchEthereumChain')}>wallet_switchEthereumChain</Button>
          <Button onClick={bindOperateEthereumChain('wallet_addEthereumChain')}>wallet_addEthereumChain</Button>
        </Group>
        <Group>
          <Title>7. web3.eth</Title>
          <Button onClick={handleGetAccounts}>Get Accounts</Button>
        </Group>
        <Group>
          <Title>8. Custom rpc request</Title>
          <Button onClick={handleCustomRpcRequest}>Send</Button>
        </Group>
        <Group>
          <Title>9. Smart Contract</Title>
          <Button onClick={handleGoerliMint}>Mint - goerli</Button>
          <Button onClick={handleBscTestnetMint}>Mint - bsc testnet</Button>
          <Button onClick={handleTransfer721}>Transfer721</Button>
        </Group>
        {!enableIframe && (
          <Group>
            <Title>10. Popup mode</Title>
            <Button onClick={handlePopupBlockedByBrowser}>popup blocked by browser</Button>
          </Group>
        )}
      </Wrapper>
    </Container>
  );
}

export default React.memo(App);

const Container = styled.div`
  display: flex;
  height: auto;
  min-height: 100vh;
  padding: 40px 40px 0;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div`
  width: 100%;
  width: 300px;
`;

const Button = styled.button`
  cursor: pointer;
  width: 100%;
  background-color: rgba(20, 0, 0, 0.2);
  height: 42px;
  font-size: 12px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-bottom: 20px;
  &:hover {
    opacity: 0.5;
  }
`;

const Group = styled.div`
  padding-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 14px;
  font-weight: bold;
`;

const InfoText = styled.span`
  display: block;
  word-break: break-all;
  color: #fff;
  margin-bottom: 20px;
`;
