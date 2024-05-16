// SmartContractInteraction.js
import React, { useState } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { KovanTokens } from './KovanTokens';
import TokenApproval from './approve';

const LiquidityComponent = ({ contractAddress, contractABI, signer }) => {
  const [selectedToken, setSelectedToken] = useState('');
  const [tokenAmount, setTokenAmount] = useState('');

  const tokens = KovanTokens(); // 从KovanTokens获取代币列表
  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  const handleAddLiquidity = async () => {
    if (!selectedToken || !tokenAmount) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please select a token and enter the amount.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      const parsedAmount = ethers.utils.parseEther(tokenAmount);
      const ethValue = ethers.utils.parseEther('0.1'); // 你可以根据实际情况调整

      const txResponse = await contract.addLiquidity(parsedAmount, { value: ethValue });
      await txResponse.wait();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Liquidity added successfully.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Great!'
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Failed to Add Liquidity',
        text: `Add Liquidity failed: ${error.message}`,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Close'
      });
    }
  };

  return (
    <div>
      <select
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
      >
        <option value="">Select Token</option>
        {tokens.map((token) => (
          <option key={token.address} value={token.name}>
            {token.name}
          </option>
        ))}
      </select>
      <input
        type="number"
        placeholder="Token Amount"
        value={tokenAmount}
        onChange={(e) => setTokenAmount(e.target.value)}
      />
      <TokenApproval tokenName={selectedToken} amount={tokenAmount} spenderAddress={contractAddress} />
      <hr />
      <button onClick={handleAddLiquidity}>
        Add Liquidity
      </button>
    </div>
  );
};

export default LiquidityComponent;




