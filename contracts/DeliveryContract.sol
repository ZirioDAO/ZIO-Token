// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeliveryContract {
    struct Package {
        address customer;
        address driver;
        uint256 paymentAmount;
        string addressA;
        string addressB;
        string notes;
        bool isDelivered;
        bool isEtherPayment;
        IERC20 token; // If isEtherPayment is false, this will be the ERC20 token used for payment.
    }

    uint256 public packageId = 0;
    mapping(uint256 => Package) public packages;

    function createPackage(
        uint256 _paymentAmount,
        string memory _addressA,
        string memory _addressB,
        string memory _notes,
        bool _isEtherPayment,
        IERC20 _token
    ) public payable {
        require(
            _isEtherPayment || msg.value == 0,
            "Ether sent for token payment"
        );
        require(
            !_isEtherPayment || msg.value == _paymentAmount,
            "Incorrect ether sent"
        );

        if (!_isEtherPayment) {
            require(
                _token.balanceOf(msg.sender) >= _paymentAmount,
                "Insufficient token balance"
            );
            _token.transferFrom(msg.sender, address(this), _paymentAmount);
        }

        packages[packageId] = Package({
            customer: msg.sender,
            driver: address(0),
            paymentAmount: _paymentAmount,
            addressA: _addressA,
            addressB: _addressB,
            notes: _notes,
            isDelivered: false,
            isEtherPayment: _isEtherPayment,
            token: _token
        });

        packageId++;
    }

    function acceptPackage(uint256 _packageId) public {
        Package storage p = packages[_packageId];
        require(p.driver == address(0), "Package already accepted");

        p.driver = msg.sender;
    }

    function confirmDelivery(uint256 _packageId) public {
        Package storage p = packages[_packageId];
        require(
            msg.sender == p.customer || msg.sender == p.driver,
            "Only customer or driver can confirm delivery"
        );
        require(!p.isDelivered, "Package already delivered");

        p.isDelivered = true;

        if (p.isEtherPayment) {
            payable(p.driver).transfer(p.paymentAmount);
        } else {
            p.token.transfer(p.driver, p.paymentAmount);
        }
    }
}
