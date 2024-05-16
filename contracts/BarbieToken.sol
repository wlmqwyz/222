// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts@4.9.3/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts@4.9.3/access/Ownable.sol";

contract BarbieToken is ERC20Votes, Ownable {

    IERC20 public token1;
    IERC20 public token2;
    IERC20 public token3;

    constructor(
        string memory name,
        string memory symbol,
        address _token1Address,
        address _token2Address,
        address _token3Address
    ) ERC20(name, symbol) ERC20Permit(name) {
        token1 = IERC20(_token1Address);
        token2 = IERC20(_token2Address);
        token3 = IERC20(_token3Address);
    }

    // Override necessary methods from ERC20Votes
    function balanceOf(address account) public view override returns (uint256) {
        uint256 totalBalance = token1.balanceOf(account) + token2.balanceOf(account) + token3.balanceOf(account);
        return totalBalance;
    }

    function _afterTokenTransfer(address from, address to, uint256 amount) internal override(ERC20Votes) {
        super._afterTokenTransfer(from, to, amount);
    }

    function _mint(address to, uint256 amount) internal override(ERC20Votes) {
        super._mint(to, amount);
    }

    function _burn(address account, uint256 amount) internal override(ERC20Votes) {
        super._burn(account, amount);
    }
}
