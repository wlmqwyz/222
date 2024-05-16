// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IPool {
    function cryptoDevTokenToEth(uint256 _tokensSold, uint256 _minEth) external;
    function ethToCryptoDevToken(uint256 _minTokens) external payable;
}

interface SwapInterface {
    function swapAforB(uint256 amountA) external payable;
}