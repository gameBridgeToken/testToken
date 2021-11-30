
pragma solidity ^0.8.9;

import './TestyBoi2.sol';

contract TestyBoi2Sale {
    address admin;
    TestyBoi2 public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(
        address _buyer,
        uint256 _amount
    );

    constructor(TestyBoi2 _tokenContract, uint256 _tokenPrice) {
        // assign an admin (can end sale)
        admin = msg.sender;
        // assign Token Contract
        tokenContract = _tokenContract;
        // set Token Price
        tokenPrice = _tokenPrice;
    }

    //multiply safemath
     function multiply(uint x, uint y) internal pure returns (uint z) {
        require(y == 0 || (z = x * y) / y == x);
    }

    // buying tokens
    function buyTokens(uint256 _numberOfTokens) public payable {
        // require -
        // that value is equal to tokens
        // that the contract holds enough tokens
        // that xfer is succesful
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));

        // keep track of tokens sold
        tokensSold += _numberOfTokens;
        
        // emit sell event
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public  {
        // require admin
        require(msg.sender == admin);
        // transfer remaining tokens to admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        
        // destroy contract
        payable(admin).transfer(address(this).balance);
    }
}