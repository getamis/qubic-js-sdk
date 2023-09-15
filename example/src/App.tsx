import React, { useCallback, useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useWeb3React } from '@web3-react/core';
import { Contract, BigNumber, ContractReceipt, utils } from 'ethers';
import { recoverTypedSignature, recoverTypedSignature_v4 } from 'eth-sig-util';
import { v4 as uuidv4 } from 'uuid';
import { Network, SignInProvider } from '@qubic-js/core';

import { ERC20_ABI, ERC721_ABI } from './abi';
import wrappedConnectors from './wrappedConnectors';
import { enableIframe } from './queryParams';
import QubicWalletConnector from '@qubic-js/react';
import { compareAddressAndLog } from './utils';

const qubicWalletConnector = wrappedConnectors.qubic[0] as QubicWalletConnector;

// https://goerli.etherscan.io/address/0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c
const ERC_20_EXAMPLE_CONTRACT_ADDRESS = '0x022E292b44B5a146F2e8ee36Ff44D3dd863C915c';
const ERC_20_EXAMPLE_CHAIN_ID = 5;
const ERC_20_EXAMPLE_EXPLORER_TX = 'https://goerli.etherscan.io/tx';

// These are from dev/stag/prod creator contract
const SKIP_PREVIEW_SIGN_CHAIN_ID = 80001;
const SKIP_PREVIEW_SIGN_CONTRACT_ADDRESS_DEV = '0xe2CF55b027d49D14f663aa1B76177F271cF8C0C6';
const SKIP_PREVIEW_SIGN_CONTRACT_ADDRESS_STAG = '0xf04bca9e84e938e3e84eb58ea936e38012c7546f';
const SKIP_PREVIEW_SIGN_CONTRACT_ADDRESS_PROD = '0x8135b33986F5112a535609c2e5A423d55808B14b';

function App() {
  const { hooks } = useWeb3React();
  const [enableSignMsgAfterActivate, setEnableSignMsgAfterActivate] = useState(false);

  const { usePriorityAccount, usePriorityProvider, usePriorityChainId } = hooks;

  const address = usePriorityAccount();
  const network = usePriorityChainId();
  const web3Provider = usePriorityProvider();

  const currentProvider = useMemo(() => web3Provider?.provider, [web3Provider?.provider]);

  useEffect(() => {
    if (!currentProvider) return;
    const onAccountsChanged = (accounts: string[]) => {
      console.log('accountsChanged', accounts);
    };
    (currentProvider as any).on('accountsChanged', onAccountsChanged);
    return () => {
      (currentProvider as any).off('accountsChanged', onAccountsChanged);
    };
  }, [currentProvider]);

  useEffect(() => {
    if (enableSignMsgAfterActivate && address && currentProvider?.request) {
      setEnableSignMsgAfterActivate(false);

      const from = address;
      currentProvider
        .request({
          method: 'qubic_login',
          params: [
            from,
            JSON.stringify({
              name: 'Qubic Demo',
              url: 'https://www.qubic.app',
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
          console.log(`signature=${signature}`);
        })
        .catch(console.error);
    }
  }, [address, currentProvider, enableSignMsgAfterActivate]);

  const handleSignInUp = useCallback(async () => {
    try {
      qubicWalletConnector.removeSignInProvider();
      await qubicWalletConnector.activate();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const handleConnectEagerly = useCallback(() => {
    qubicWalletConnector.connectEagerly();
  }, []);

  const bindSignInUpWithSignInProvider = useCallback(
    (signInProvider: SignInProvider) => () => {
      qubicWalletConnector.setSignInProvider(signInProvider);
      qubicWalletConnector.activate().catch(e => {
        console.error(e);
      });
    },
    [],
  );

  const handleSignInUpAndSignMessage = useCallback(() => {
    setEnableSignMsgAfterActivate(true);
    qubicWalletConnector.activate().catch(e => {
      console.error(e);
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    qubicWalletConnector.deactivate();
  }, []);

  const handleEstimateGas = useCallback(async () => {
    if (!web3Provider) throw Error('no web3Provider');
    const gas = await web3Provider.estimateGas({
      from: address,
      to: '0xd46e8dd67c5d32be8058bb8eb970870f07244567',
      gasPrice: '0x9184e72a000',
      value: '0x9184e72a',
      data: '0xd46e8dd67c5d32be8d46e8dd67c5d32be8058bb8eb970870f072445675058bb8eb970870f072445675',
    });

    console.log(`gas=${gas.toString()}`);
  }, [address, web3Provider]);

  const handleSend = useCallback(async () => {
    if (!web3Provider) throw Error('no web3Provider');
    if (!address) throw Error('no address');
    const tx = {
      // this could be provider.addresses[0] if it exists
      from: address,
      // target address, this could be a smart contract address
      to: '0xdd2c45b296C218779783c9AAF9f876391FA9aF53',
      // optional if you want to specify the gas limit
      gasLimit: 21000,
      // optional if you are invoking say a payable function
      value: utils.parseUnits('0.0001'),
    };

    const response = await web3Provider.getSigner().sendTransaction(tx);
    console.log(response);
  }, [address, web3Provider]);

  const handleGetERC20 = useCallback(async () => {
    if (!web3Provider) throw Error('no web3Provider');
    if (!address) throw Error('no account');
    if (network !== ERC_20_EXAMPLE_CHAIN_ID) throw Error(`chain id should be ${ERC_20_EXAMPLE_CHAIN_ID}`);

    const tx = {
      from: address,
      to: ERC_20_EXAMPLE_CONTRACT_ADDRESS,
      value: '0',
      // 0xdeadbeef is a method to request erc20 token
      data: '0xdeadbeef',
    };

    const response = await web3Provider.getSigner().sendTransaction(tx);
    console.log(`${ERC_20_EXAMPLE_EXPLORER_TX}/${response.hash}`);
    console.log('waiting...');
    const recipient = await response.wait();
    console.log('done!');
    console.log(recipient);
  }, [address, network, web3Provider]);

  const handleSendERC20 = useCallback(async () => {
    if (!web3Provider) throw Error('no web3Provider');
    if (!address) throw Error('no account');
    if (network !== ERC_20_EXAMPLE_CHAIN_ID) throw Error(`chain id should be ${ERC_20_EXAMPLE_CHAIN_ID}`);

    const erc20TokenContract = new Contract(ERC_20_EXAMPLE_CONTRACT_ADDRESS, ERC20_ABI, web3Provider.getSigner());

    const toAddress = '0xdd2c45b296C218779783c9AAF9f876391FA9aF53';
    // Calculate contract compatible value for approve with proper decimal points using BigNumber
    const tokenDecimals = BigNumber.from(18);
    const tokenAmountToApprove = BigNumber.from(10);
    const amount = tokenAmountToApprove.mul(BigNumber.from(10).pow(tokenDecimals)).toHexString();

    // call transfer function

    const response = await erc20TokenContract.transfer(toAddress, amount);
    console.log(`${ERC_20_EXAMPLE_EXPLORER_TX}/${response.hash}`);
    console.log('waiting...');
    const receipt = await response.wait();
    console.log('done!');
    console.log(receipt);
  }, [address, network, web3Provider]);

  const handleApproveERC20 = useCallback(async () => {
    if (!web3Provider) throw Error('no web3Provider');
    if (!address) throw Error('no address');
    if (network !== ERC_20_EXAMPLE_CHAIN_ID) throw Error(`chain id should be ${ERC_20_EXAMPLE_CHAIN_ID}`);

    const spender = '0x7a250d5630b4cf539739df2c5dacb4c659f2488d'; // spender: dapp uniswap smart contract address
    const tokenDecimals = BigNumber.from(18);
    const tokenAmountToApprove = BigNumber.from(1);
    const amount = tokenAmountToApprove.mul(BigNumber.from(10).pow(tokenDecimals)).toHexString();
    const contractAddress = ERC_20_EXAMPLE_CONTRACT_ADDRESS;
    const erc20TokenContract = new Contract(contractAddress, ERC20_ABI, web3Provider.getSigner());
    const response = await erc20TokenContract.approve(spender, amount);
    console.log(`${ERC_20_EXAMPLE_EXPLORER_TX}/${response.hash}`);
    console.log('waiting...');
    const receipt = await response.wait();
    console.log('done!');
    console.log(receipt);
  }, [address, network, web3Provider]);

  const handleSignHelper = useCallback(
    async (message: string, signPromise: Promise<string>) => {
      try {
        const signature = await signPromise;
        // const signature = await web3.eth.personal.sign(data, addr, 'xxxxxx');
        console.log(`signature=${signature}`);

        const recoverAddress = utils.verifyMessage(message, signature);
        compareAddressAndLog(recoverAddress, address);
      } catch (err) {
        const { code, message, stack } = err as any;
        console.error({
          code,
          message,
          stack,
        });
      }
    },
    [address],
  );

  const handleSkipPreviewSign = useCallback(async () => {
    if (!currentProvider?.request) {
      throw Error('currentProvider.request not found');
    }

    const requestId = uuidv4();
    const from = address;
    const createdAt = Math.floor(new Date().getTime() / 1000);

    const msgParams = {
      requestId,
      userAddress: address,
      customData: '{"test":"hello?","messageA":[1,4,6],"messageB":500}',
      webhookUrl: 'https://qubic-pass-demo.herokuapp.com/api/hook',
      createdAt,
    };

    const message = JSON.stringify(msgParams);

    handleSignHelper(
      message,
      currentProvider.request({
        method: 'qubic_skipPreviewSign',
        params: [message, from],
      }),
    );
  }, [address, currentProvider, handleSignHelper]);

  const bindSkipPreviewSignTypedData = useCallback(
    (contractAddress: string) => async () => {
      if (!currentProvider?.request) {
        throw Error('currentProvider.request not found');
      }
      if (network !== SKIP_PREVIEW_SIGN_CHAIN_ID) throw Error(`chain id should be ${SKIP_PREVIEW_SIGN_CHAIN_ID}`);

      // that any contract address deployed by qubic creator market
      // const contractAddress = CONTRACT_ADDRESS_IN_WHITE_LIST;
      const chainId = utils.hexlify(Number(SKIP_PREVIEW_SIGN_CHAIN_ID));
      const toBeSigned = `{"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"},{"name":"verifyingContract","type":"address"}],"ForwardRequest":[{"name":"from","type":"address"},{"name":"to","type":"address"},{"name":"value","type":"uint256"},{"name":"gas","type":"uint256"},{"name":"nonce","type":"uint256"},{"name":"data","type":"bytes"}]},"primaryType":"ForwardRequest","domain":{"name":"GenericForwarderV2","version":"0.0.1","chainId":"${chainId}","verifyingContract":"0xDA09Ac0B1edDc502D2ca5F851516d32657Cf32c8","salt":""},"message":{"data":"0xb88d4fde00000000000000000000000046196bc1c0ef858f2f4034ee7e6121823a94b9000000000000000000000000002cb03697c0eb0a5a3cf5f23051c961962bb3c912000000000000000000000000000000000000000000000000000000000000004b000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000009d75f848328b25df36873e41ec5d79a9b10316f6000000000000000000000000000000000000000000000000000000000000004b000000000000000000000000435792217934f5704c9105561dbb1939a2373b680000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000006343dfab000000000000000000000000000000000000000000000000000000000000001ba5ca7b2e3df628a2814975546274f5d2fea14e7f89166f5fc55ba29281a3438d21ab25033a44d0bb7253c472f2c3223454dac57ec5cbbf10433805c74cda83000000000000000000000000000000000000000000000000000000000000000044bcbd92e00000000000000000000000009d75f848328b25df36873e41ec5d79a9b10316f6000000000000000000000000000000000000000000000000000000000000004b00000000000000000000000000000000000000000000000000000000","from":"0x46196Bc1C0Ef858f2F4034ee7e6121823A94B900","gas":"152143","nonce":"115792089237316195423570985008687907853269984665640564039457584007913129639935","to":"${contractAddress}","value":"0"}}`;

      const signature = await currentProvider.request({
        method: 'qubic_skipPreviewSignTypedData',
        params: [address, toBeSigned],
      });

      const msgParams = JSON.parse(toBeSigned);

      const recoveredAddr = recoverTypedSignature_v4({
        data: msgParams as any,
        sig: signature,
      });

      compareAddressAndLog(recoveredAddr, address);
    },
    [address, currentProvider, network],
  );

  const handlePersonalSign = useCallback(() => {
    if (!web3Provider) throw Error('no web3Provider');
    const message = 'example message';
    handleSignHelper(message, web3Provider.getSigner().signMessage(message));
  }, [web3Provider, handleSignHelper]);

  const handlePersonalSignUnknownEncoding = useCallback(async () => {
    if (!web3Provider) throw Error('no web3Provider');
    const data = `0xb073a86cd7e07dc4c222a7b4c489149c627684842c74b7dab99a2f99ceb46249`;
    const message = utils.arrayify(data);
    const signature = await web3Provider.getSigner().signMessage(message);
    const recoveredAddress = utils.recoverAddress(utils.hashMessage(message), signature);
    console.log(recoveredAddress);
    compareAddressAndLog(recoveredAddress, address);
  }, [address, web3Provider]);

  const handleSignTypedDataV3 = useCallback(async () => {
    if (!currentProvider?.request) {
      throw Error('currentProvider.request not found');
    }

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
        chainId: network,
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

    const signature = await currentProvider.request({
      method: 'eth_signTypedData_v3',
      params: [from, JSON.stringify(msgParams)],
    });

    const recoveredAddr = recoverTypedSignature({
      data: msgParams as any,
      sig: signature,
    });
    compareAddressAndLog(recoveredAddr, address);
  }, [address, network, currentProvider]);

  const handleSignTypedDataV4 = useCallback(async () => {
    if (!currentProvider?.request) {
      throw Error('currentProvider.request not found');
    }

    const from = address;
    const msgParams = {
      domain: {
        chainId: network,
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

    const signature = await currentProvider.request({
      method: 'eth_signTypedData_v4',
      params: [from, JSON.stringify(msgParams)],
    });

    const recoveredAddr = recoverTypedSignature_v4({
      data: msgParams as any,
      sig: signature,
    });

    compareAddressAndLog(recoveredAddr, address);
  }, [address, network, currentProvider]);

  const bindOperateEthereumChain = useCallback(
    (method: 'wallet_addEthereumChain' | 'wallet_switchEthereumChain') => () => {
      if (!currentProvider?.request) {
        throw Error('currentProvider.request not found');
      }
      // eslint-disable-next-line no-alert
      const answer = window.prompt(`What's you chain id?`);
      if (answer === null) {
        return;
      }
      const nextChainId = Number(answer);

      currentProvider.request({
        method,
        params: [
          {
            chainId: `0x${nextChainId.toString(16)}`,
          },
        ],
      });
    },
    [currentProvider],
  );

  const handleGetAccounts = useCallback(async () => {
    if (!web3Provider) {
      throw Error('web3Provider not found');
    }
    const accounts = await web3Provider.listAccounts();
    console.log({ accounts });
  }, [web3Provider]);

  const handleCustomRpcRequest = useCallback(async () => {
    if (!currentProvider?.request) {
      throw Error('currentProvider.request not found');
    }
    // eslint-disable-next-line no-alert
    const answer = window.prompt('paste json rpc request');
    try {
      if (answer) {
        const rpcJson = JSON.parse(answer);
        const response = await currentProvider.request(rpcJson);
        console.log(response);
      }
    } catch (error) {
      console.error(error);
    }
  }, [currentProvider]);

  const handleQubicIdentityToken = useCallback(async () => {
    if (!currentProvider?.request) {
      throw Error('currentProvider.request not found');
    }

    const [ticket, expiredAt] = await currentProvider.request({
      method: 'qubic_issueIdentityTicket',
      params: [],
    });
    console.log({
      ticket,
      expiredAt,
    });
  }, [currentProvider]);

  const handlePopupBlockedByBrowser = useCallback(async () => {
    if (!currentProvider?.request) {
      throw Error('currentProvider.request not found');
    }
    // wait a little time to trigger browser block popup window
    const ref = window.open(
      'https://www.google.com',
      '_blank',
      'location=no,resizable=yes,scrollbars=yes,status=yes,height=100,width=100',
    );
    ref?.close();
    const response = currentProvider.request({
      method: 'eth_requestAccounts',
      params: [],
    });

    console.log(response);
  }, [currentProvider]);

  const handleNftMint = useCallback(
    (options: { targetNetwork: Network; contractAddress: string }) => {
      if (!web3Provider) {
        throw Error('web3Provider not found');
      }
      if (!address) return;
      const { targetNetwork, contractAddress } = options;

      if (network !== targetNetwork) {
        window.alert(`Network should be chain id: ${targetNetwork}`);
        return;
      }
      const mineTestContract = new Contract(contractAddress, ERC721_ABI, web3Provider);
      mineTestContract.methods
        .mint(address)
        .send({ from: address })
        .on('error', (mintError: Error): void => {
          console.error(mintError);
        })
        .once('transactionHash', (hash: string) => {
          console.log(hash);
        })
        .once('receipt', (receipt: ContractReceipt) => {
          console.log(receipt);
        });
    },
    [address, network, web3Provider],
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
    if (!web3Provider) {
      throw Error('web3Provider not found');
    }
    if (!address) return;

    const contractAddress = window.prompt('NFT contract address');
    if (!contractAddress) return;
    const tokenId = window.prompt('NFT token id');
    if (!tokenId) return;
    const toAddress = window.prompt('To address');
    if (!toAddress) return;

    const mineTestContract = new Contract(contractAddress, ERC721_ABI, web3Provider);
    mineTestContract.methods
      .safeTransferFrom(address, toAddress, tokenId)
      .send({ from: address })
      .on('error', (mintError: Error): void => {
        console.error(mintError);
      })
      .once('transactionHash', (hash: string) => {
        console.log(hash);
      })
      .once('receipt', (receipt: ContractReceipt) => {
        console.log(receipt);
      });
  }, [address, web3Provider]);

  const isConnected = !!address && !!network;

  return (
    <Container>
      <Wrapper>
        <InfoText>請開啟 Devtool 查看 console 訊息</InfoText>
        <Group>
          <Title>錢包狀態</Title>
          {isConnected ? (
            <InfoText>
              address: <br /> {address}
              <br />
              <br />
              network: {network}
            </InfoText>
          ) : (
            <InfoText>未連結</InfoText>
          )}
        </Group>
        <Group>
          <Title>註冊或登錄以獲得地址</Title>
          <Button onClick={handleSignInUp}>SIGN IN / SIGN UP</Button>
          <Button onClick={handleConnectEagerly}>Connect Eagerly</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.GOOGLE)}>google</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.FACEBOOK)}>facebook</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.APPLE)}>apple</Button>
          <Button onClick={bindSignInUpWithSignInProvider(SignInProvider.YAHOO)}>yahoo</Button>
          <Button onClick={handleSignInUpAndSignMessage}>{`SIGN IN / SIGN UP\nAnd Sign custom message`}</Button>
          <Button onClick={handleQubicIdentityToken}>qubic_issueIdentityTicket</Button>
          {isConnected && <Button onClick={handleDisconnect}>Disconnect</Button>}
        </Group>
        <Group>
          <Title>標準 JSON RPC Method</Title>
          <Button onClick={handleGetAccounts}>eth_accounts</Button>
          <Button onClick={handleEstimateGas}>eth_estimateGas</Button>
          <InfoText>ETH 交易，須先有 ETH</InfoText>
          <Button onClick={handleSend}>eth_sendRawTransaction</Button>
          <Button onClick={bindOperateEthereumChain('wallet_switchEthereumChain')}>wallet_switchEthereumChain</Button>
          <Button onClick={bindOperateEthereumChain('wallet_addEthereumChain')}>wallet_addEthereumChain</Button>
        </Group>

        <Group>
          <Title>ERC-20 交易</Title>
          <InfoText>以下範例要先切到 chain id:{ERC_20_EXAMPLE_CHAIN_ID}</InfoText>
          <Button onClick={handleGetERC20}>Get Test ERC-20 Token</Button>
          <Button onClick={handleSendERC20}>Send Test ERC-20 Token</Button>
          <Button onClick={handleApproveERC20}>Approve Test ERC-20 Token</Button>
        </Group>

        <Group>
          <Title>簽名</Title>
          <Button onClick={handlePersonalSign}>personal_sign</Button>
          <Button onClick={handlePersonalSignUnknownEncoding}>personal_sign_unknown_encoding</Button>
          <Button onClick={handleSignTypedDataV3}>eth_signTypedData_v3</Button>
          <Button onClick={handleSignTypedDataV4}>eth_signTypedData_v4</Button>
        </Group>

        <Group>
          <Title>Smart Contract</Title>
          <Button onClick={handleGoerliMint}>Mint - goerli</Button>
          <Button onClick={handleBscTestnetMint}>Mint - bsc testnet</Button>
          <Button onClick={handleTransfer721}>Transfer721</Button>
        </Group>

        <Group>
          <Title>Qubic Only RPC Method</Title>
          <Button onClick={handleSkipPreviewSign}>qubic_skipPreviewSign</Button>
          <InfoText>以下範例要先切到 chain id: {SKIP_PREVIEW_SIGN_CHAIN_ID} </InfoText>
          <Button onClick={bindSkipPreviewSignTypedData(SKIP_PREVIEW_SIGN_CONTRACT_ADDRESS_DEV)}>
            qubic_skipPreviewSignTypedData - dev
          </Button>
          <Button onClick={bindSkipPreviewSignTypedData(SKIP_PREVIEW_SIGN_CONTRACT_ADDRESS_STAG)}>
            qubic_skipPreviewSignTypedData - stag
          </Button>
          <Button onClick={bindSkipPreviewSignTypedData(SKIP_PREVIEW_SIGN_CONTRACT_ADDRESS_PROD)}>
            qubic_skipPreviewSignTypedData - prod
          </Button>
        </Group>

        <Group>
          <Title>傳送任意 RPC</Title>
          <Button onClick={handleCustomRpcRequest}>Send</Button>
        </Group>

        {!enableIframe && (
          <Group>
            <Title>Popup mode</Title>
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
  width: 320px;
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
  margin-bottom: 8px;
  font-size: 12px;
`;
