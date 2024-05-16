// SPDX-License-Identifier: MIT


pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./IPool.sol"; 
contract oneToMulti{
    // -------  State ------- //
    // string public leftName;
    // string[] public rightName;
    // uint256[] public percentage;

    // uint256 public leftAmount;
    mapping(string => address) public addressBook;
    mapping(string => address) public tokenAddresses; 
    mapping(string => address) public poolAddresses; 
    
    // --------------------------  Functions  ------------------------- //
    /*
     * Create a new Portfolio token representing a set of underlying assets.
     *
     * @param  name_   the name of the Portfolio
     * @param  symbol_   the symbol for the Portfolio token
     * @param  tokenAddresses_   the addresses of the ERC20 tokens that make up the Portfolio
     * @param  percentageHoldings_   the desired percentage holding for each token specified in tokenAddresses_
     * @param  owner_   the address of the Portfolio owner
     * @param  ownerFee_   the size of the fee paid to the owner by buyers (in basis points)
     */
    // constructor(
    //     string memory leftName_,
    //     string[] memory rightName_,
    //     uint256[] memory percentage_,
    //     uint256 leftAmount_
    // ) {
    //     require(
    //         rightName_.length == percentage_.length,
    //         "Please specify the same number of token addresses as percentage holdings"
    //     );
    //     require(
    //         sum(percentage_) == 100,
    //         "Percentage holdings must sum to 100"
    //     );
           
    //     require(bytes(leftName_).length != 0, "leftName cannot be empty");



    //     leftName = leftName_;
    //     rightName = rightName_;
    //     percentage = percentage_;
    //     leftAmount=leftAmount_;


    //     }



    function sum(uint256[] memory list) private pure returns (uint256) {
        uint256 s = 0;
        for (uint256 i = 0; i < list.length; i++) {
            s += list[i];
        }
        return s;
    }

    function setTokenAddress(string memory name, address taddress) public { tokenAddresses[name] = taddress; }
    function getTokenAddress(string memory name) public view returns (address) { 
        require(tokenAddresses[name] != address(0), "Token not registered."); 
        return tokenAddresses[name];
    }

    function setPoolAddress(string memory name, address paddress) public { poolAddresses[name] = paddress; }
    function getPoolAddress(string memory name) public view returns (address) { 
        require(poolAddresses[name] != address(0), "Token not registered."); 
        return poolAddresses[name];
    }


    function erc20Toeth(string memory leftname,uint256 leftAmount,uint256 percent) public {

        // 获取 A、B 的组合名称
        address ercAddress = getPoolAddress(leftname);
        address ercToken=getTokenAddress(leftname);
        // 获取 A、B 对应的合约地址
        uint256 amount = leftAmount*percent/100;
        uint256 allowed = IERC20(ercToken).allowance(msg.sender, address(this));
        require(allowed >= amount, "Insufficient allowance for exchange contract.");
        
        require(ercAddress != address(0), "contract address not set");
        IERC20(ercToken).transferFrom(msg.sender, address(this), amount);
        IERC20(ercToken).approve(ercAddress, amount);

        
        // 调用合约的 swapAforB 函数
        IPool(ercAddress).cryptoDevTokenToEth(amount,0);
        payable (msg.sender).transfer(address(this).balance);
    }

    function ethtoerc20(string memory right_name, uint256 percent) public payable {
        address ercPoolAddress = getPoolAddress(right_name);
        address ercTokenAddress = getTokenAddress(right_name);
        // address ercToken  = getTokenAddress(right_name);
        require(ercPoolAddress != address(0), "contract address not set");
        IPool(ercPoolAddress).ethToCryptoDevToken{value:msg.value*percent/100}(0);
        claimTokensFromPool(ercTokenAddress);
    }

    function erc20Toerc20(string memory left_Name, uint256 leftAmount,string memory right_Name,uint256 percent) public  payable{

        address ercAddressleft = getPoolAddress(left_Name);
        address ercAddressright = getPoolAddress(right_Name);
        address ercTokenleft  = getTokenAddress(left_Name);
        address ercTokenright  = getTokenAddress(right_Name);
        uint amountA = leftAmount*percent/100;
        uint256 allowed = IERC20(ercTokenleft).allowance(msg.sender, address(this));
        require(allowed >= amountA, "Insufficient allowance for exchange contract.");

     

// 将代币从用户授权给poolA
        IERC20(ercTokenleft).transferFrom(msg.sender, address(this), amountA);
        IERC20(ercTokenleft).approve(ercAddressleft, amountA);

        // 调用 A 代币池合约进行交换cryptoDevTokenToEth
        IPool(ercAddressleft).cryptoDevTokenToEth(amountA, 0);  // 直接调用，更安全且语义更清晰

        // 将获得的 ETH 调用 B 代币池合约进行交换
        uint ethBalance = address(this).balance;
        IPool(ercAddressright).ethToCryptoDevToken{value: ethBalance}(0);  // 假设 ethToCryptoDevToken 函数存在并以这种方式工作

        // 取回所有的 B 代币到用户钱包地址
        claimTokensFromPool(ercTokenright);
    }
        // 从代币池合约提取指定代币到调用者地址
    function claimTokensFromPool(address tokenAddress) internal {
        require(tokenAddress != address(0), "Invalid token address");

        uint256 amount = IERC20(tokenAddress).balanceOf(address(this));
        if (amount > 0) {
            IERC20(tokenAddress).transfer(msg.sender, amount);
        }
    }
    

    function executeSwap(string memory leftName, string[] memory rightName, uint256 leftAmount, uint256[] memory percentage) external payable  {
        // 判断左边是不是ETH
        if (keccak256(bytes(leftName)) == keccak256(bytes("ETH"))) {
            for (uint256 i = 0; i < rightName.length; i++) {
            ethtoerc20(rightName[i],percentage[i]);}
        } else {
            // 如果左边是ERC20
            for (uint256 i = 0; i < rightName.length; i++) {
                // 需要确保percentage_数组与rightName_长度相匹配
                require(rightName.length == percentage.length, "rightName and percentage length mismatch");
                
                // 判断右边是不是ETH
                if (keccak256(bytes(rightName[i])) == keccak256(bytes("ETH"))) {
                    // 如果右边是ETH
                    erc20Toeth(leftName,leftAmount,percentage[i]);
                } else {
                    // 如果右边是ERC20
                    erc20Toerc20(leftName, leftAmount,rightName[i], percentage[i]);
                }
            }
        }
    }

    function ethtoerc(string memory right_Name,uint value) public view returns (uint256){
        address ercAddress = getPoolAddress(right_Name);
        uint value2 = value;
        uint256 tokensBought1 = IPool(ercAddress).getAmountOfTokens(
            value2,
            address(ercAddress).balance,
            IPool(ercAddress).getReserve()
        );
        return tokensBought1;
    }

    function erctoeth(string memory left_Name,uint value) public view returns (uint256){
        address ercAddress = getPoolAddress(left_Name);
        uint value1 = value;
        uint256 tokensBought = IPool(ercAddress).getAmountOfTokens(
            value1,
            IPool(ercAddress).getReserve(),
            address(ercAddress).balance
            
        );
        return tokensBought;

    }
    function all(string memory left_Name,string[] memory right_Name,uint value,uint[] memory percent) public view returns (uint256[] memory){
        uint[] memory numerc = new uint[](right_Name.length);

        uint numeth;
        if (keccak256(bytes(left_Name)) == keccak256(bytes("ETH"))) {
            for (uint256 i = 0; i < right_Name.length; i++) {
                numerc[i] = ethtoerc(right_Name[i],value* percent[i]/100);}
        }else{

        for (uint256 i = 0; i < right_Name.length; i++) {
            if (keccak256(bytes(right_Name[i])) == keccak256(bytes("ETH"))) {
                        // 如果右边是ETH
                numerc[i]=erctoeth(left_Name,value*percent[i]/100);
            }else{
            uint value1 = value* percent[i];
            numeth = erctoeth(left_Name,value1);
            numerc[i] = ethtoerc(right_Name[i],numeth);
            }
        }
        }
        return numerc;
    }
    receive() external payable { }
}