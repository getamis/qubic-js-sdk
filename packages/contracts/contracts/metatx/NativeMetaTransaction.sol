//SPDX-License-Identifier: MIT
pragma solidity 0.8.13;

import '@openzeppelin/contracts/utils/Context.sol';

import '../utils/EIP712.sol';
import '../utils/EIP712Domain.sol';

abstract contract NativeMetaTransaction is Context, EIP712Domain {
  constructor(string memory name, string memory version) {
    domainData = DomainData(name, version, block.chainid, address(this));
    DOMAIN_SEPARATOR = EIP712.makeDomainSeparator(name, version);
  }

  /**
   * @notice Check that function call is valid
   * @param callData      The authorized function call
   */
  function _requireValidFuntionCall(bytes memory callData) internal pure {
    if (callData.length == 0) {
      return;
    }

    bytes4 sigHash;
    assembly {
      sigHash := mload(add(callData, 32))
    }

    require(sigHash != msg.sig, 'NativeMetaTransaction: calling executeMetaTransaction is forbidden');
  }

  function _msgSender() internal view virtual override returns (address sender) {
    if (msg.sender == address(this)) {
      bytes memory array = msg.data;
      uint256 index = msg.data.length;
      assembly {
        // Load the 32 bytes word from memory with the address on the lower 20 bytes, and mask those.
        sender := and(mload(add(array, index)), 0xffffffffffffffffffffffffffffffffffffffff)
      }
    } else {
      sender = msg.sender;
    }
    return sender;
  }

  function _msgData() internal view virtual override returns (bytes calldata) {
    if (msg.sender == address(this)) {
      return msg.data[:msg.data.length - 20];
    } else {
      return msg.data;
    }
  }
}
