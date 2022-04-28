//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import '@openzeppelin/contracts/interfaces/IERC165.sol';

interface INativeMetaTransactionV1 is IERC165 {
  function executeMetaTransaction(
    address authorizer,
    bytes memory callData,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external payable returns (bytes memory);

  function getNonce(address authorizer) external view returns (uint256);
}
