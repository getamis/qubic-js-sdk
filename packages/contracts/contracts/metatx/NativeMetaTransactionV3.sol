//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import './NativeMetaTransaction.sol';
import './INativeMetaTransactionV3.sol';

// Example typed data
//
//     {
//       types: {
//         EIP712Domain: [
//           { name: "name", type: "string" },
//           { name: "version", type: "string" },
//           { name: "chainId", type: "uint256" },
//           { name: "verifyingContract", type: "address" },
//         ],
//         MetaTransaction: [
//           { name: "relayer", type: "address" },
//           { name: "authorizer", type: "address" },
//           { name: "nonce", type: "bytes32" },
//           { name: "callData", type: "bytes" },
//           { name: "validAfter", type: "uint256" },
//           { name: "validBefore", type: "uint256" },
//         ],
//       },
//       domain: {
//         name: "NativeMetaTransaction",
//         version: "1",
//         chainId: 1,
//         verifyingContract: "0x1111111111111111111111111111111111111111",
//       },
//       primaryType: "MetaTransaction",
//       message: {
//         relayer: "0x...",
//         authorizer: authorizer.address,
//         nonce: ethers.utils.randomBytes(32),
//         callData: "0x....",
//         validAfter: Math.floor(Date.now() / 1000) + 3600, // Valid after an hour
//         validBefore: validAfter + 3600,                   // Valid for an hour
//       },
//     }
//
contract NativeMetaTransactionV3 is NativeMetaTransaction, INativeMetaTransactionV3 {
  bytes32 private constant META_TRANSACTION_TYPEHASH =
    keccak256(
      bytes(
        'MetaTransaction(address relayer,address authorizer,bytes32 nonce,bytes callData,uint256 validAfter,uint256 validBefore)'
      )
    );

  bytes32 private constant CANCEL_META_TRANSACTION_TYPEHASH =
    keccak256(bytes('CancelMetaTransaction(address authorizer,bytes32 nonce)'));

  event MetaTransactionExecuted(address indexed authorizer, bytes32 indexed nonce, bytes callData);
  event MetaTransactionCancelled(address indexed authorizer, bytes32 indexed nonce);

  /**
   * @dev authorizer address => nonce => bool (true if nonce is used)
   */
  mapping(address => mapping(bytes32 => bool)) private _authorizationStates;

  constructor(string memory name, string memory version) NativeMetaTransaction(name, version) {}

  function executeMetaTransaction(
    address relayer,
    address authorizer,
    bytes32 nonce,
    bytes memory callData,
    uint256 validAfter,
    uint256 validBefore,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public payable returns (bytes memory) {
    _requireValidAuthorization(relayer, authorizer, nonce, callData, validAfter, validBefore, v, r, s);

    // Append userAddress at the end to extract it from calling context
    (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(callData, authorizer));

    require(success, 'NativeMetaTransaction: function call not successful');
    _markAuthorizationAsUsed(authorizer, nonce);
    emit MetaTransactionExecuted(authorizer, nonce, callData);

    return returnData;
  }

  /**
   * @notice Returns the state of an authorization
   * @dev Nonces are randomly generated 32-byte data unique to the
   * authorizer's address
   * @param authorizer    Authorizer's address
   * @param nonce         Nonce of the authorization
   * @return True if the nonce is used
   */
  function authorizationState(address authorizer, bytes32 nonce) external view returns (bool) {
    return _authorizationStates[authorizer][nonce];
  }

  /**
   * @notice Attempt to cancel an authorization
   * @param authorizer    Authorizer's address
   * @param nonce         Nonce of the authorization
   * @param v             v of the signature
   * @param r             r of the signature
   * @param s             s of the signature
   */
  function _cancelAuthorization(
    address authorizer,
    bytes32 nonce,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal {
    require(!_authorizationStates[authorizer][nonce], 'NativeMetaTransaction: authorization is used or canceled');

    bytes memory data = abi.encode(CANCEL_META_TRANSACTION_TYPEHASH, authorizer, nonce);

    require(EIP712.recover(DOMAIN_SEPARATOR, v, r, s, data) == authorizer, 'NativeMetaTransaction: invalid signature');

    _markAuthorizationAsUsed(authorizer, nonce);
    emit MetaTransactionCancelled(authorizer, nonce);
  }

  /**
   * @notice Check that authorization is valid
   * @param authorizer    Authorizer's address
   * @param nonce         Nonce of the authorization
   * @param callData      The authorized function call
   * @param v             v of the signature
   * @param r             r of the signature
   * @param s             s of the signature
   */
  function _requireValidAuthorization(
    address relayer,
    address authorizer,
    bytes32 nonce,
    bytes memory callData,
    uint256 validAfter,
    uint256 validBefore,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal view {
    _requireValidFuntionCall(callData);

    if (relayer != address(0)) {
      require(relayer == msg.sender, 'NativeMetaTransaction: unauthorized relayer');
    }

    require(
      block.timestamp >= validAfter && block.timestamp <= validBefore,
      'NativeMetaTransaction: authorization is expired or not active'
    );

    require(!_authorizationStates[authorizer][nonce], 'NativeMetaTransaction: authorization is used or canceled');

    bytes memory data = abi.encode(
      META_TRANSACTION_TYPEHASH,
      relayer,
      authorizer,
      nonce,
      keccak256(callData),
      validAfter,
      validBefore
    );

    require(EIP712.recover(DOMAIN_SEPARATOR, v, r, s, data) == authorizer, 'NativeMetaTransaction: invalid signature');
  }

  /**
   * @notice Mark an authorization as used
   * @param authorizer    Authorizer's address
   * @param nonce         Nonce of the authorization
   */
  function _markAuthorizationAsUsed(address authorizer, bytes32 nonce) internal {
    _authorizationStates[authorizer][nonce] = true;
  }

  function supportsInterface(bytes4 interfaceId) external view virtual returns (bool) {
    return interfaceId == type(INativeMetaTransactionV3).interfaceId;
  }
}
