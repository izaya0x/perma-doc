//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Registration {
    mapping(address => string) keys;

    constructor() {}

    function getKey() public view returns (string memory) {
        console.log("Getting key for %s", msg.sender);
        return keys[msg.sender];
    }

    function setKey(string memory key) public {
        console.log("Setting key for %s", msg.sender);
        keys[msg.sender] = key;
    }
}
