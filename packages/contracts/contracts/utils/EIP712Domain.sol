// SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

/**
 * @title EIP712 Domain
 */
contract EIP712Domain {
  struct DomainData {
    string name;
    string version;
    uint256 chainId;
    address verifyingContract;
  }

  /**
   * @dev EIP712 Domain Separator
   */
  bytes32 public DOMAIN_SEPARATOR;

  DomainData public domainData;
}
