//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import '@openzeppelin/contracts/interfaces/IERC165.sol';

interface INativeMetaTransactionV3 is IERC165 {
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
  ) external payable returns (bytes memory);

  function authorizationState(address authorizer, bytes32 nonce) external view returns (bool);
}
