//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';

import './NativeMetaTransaction.sol';
import './INativeMetaTransactionV1.sol';

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
//           { name: "authorizer", type: "address" },
//           { name: "nonce", type: "uint256" },
//           { name: "callData", type: "bytes" },
//         ],
//       },
//       domain: {
//         name: "MetaTransaction",
//         version: "1",
//         chainId: 1,
//         verifyingContract: "0x1111111111111111111111111111111111111111",
//       },
//       primaryType: "MetaTransaction",
//       message: {
//         authorizer: authorizer.address,
//         nonce: 1
//         callData: "0x....",
//       },
//     }
//
contract NativeMetaTransactionV1 is NativeMetaTransaction, INativeMetaTransactionV1 {
  using SafeMath for uint256;

  bytes32 private constant META_TRANSACTION_TYPEHASH =
    keccak256(bytes('MetaTransaction(address authorizer,uint256 nonce,bytes callData)'));

  event MetaTransactionExecuted(address authorizer, address relayer, bytes callData);
  mapping(address => uint256) private nonces;

  constructor(string memory name, string memory version) NativeMetaTransaction(name, version) {}

  function executeMetaTransaction(
    address authorizer,
    bytes memory callData,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public payable returns (bytes memory) {
    _requireValidAuthorization(authorizer, callData, v, r, s);

    nonces[authorizer] = nonces[authorizer].add(1);

    // Append authorizer at the end to extract it from calling context
    (bool success, bytes memory returnData) = address(this).call(abi.encodePacked(callData, authorizer));

    require(success, 'NativeMetaTransaction: function call not successful');
    emit MetaTransactionExecuted(authorizer, msg.sender, callData);

    return returnData;
  }

  function getNonce(address authorizer) external view returns (uint256 nonce) {
    nonce = nonces[authorizer];
  }

  /**
   * @notice Check that authorization is valid
   * @param authorizer   User's address
   * @param callData      The authorized function call
   * @param v             v of the signature
   * @param r             r of the signature
   * @param s             s of the signature
   */
  function _requireValidAuthorization(
    address authorizer,
    bytes memory callData,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) internal view {
    _requireValidFuntionCall(callData);

    bytes memory data = abi.encode(META_TRANSACTION_TYPEHASH, authorizer, nonces[authorizer], keccak256(callData));

    require(EIP712.recover(DOMAIN_SEPARATOR, v, r, s, data) == authorizer, 'NativeMetaTransaction: invalid signature');
  }

  function supportsInterface(bytes4 interfaceId) external view virtual returns (bool) {
    return interfaceId == type(INativeMetaTransactionV1).interfaceId;
  }
}
