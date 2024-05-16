import React, { useState } from 'react';
import { ethers } from 'ethers';
import { KovanTokens } from './KovanTokens';
import Swal from 'sweetalert2'
import { blue, pink } from '@mui/material/colors';

// or via CommonJS


const TokenApproval = ({ tokenName, amount }) => {
  const [status, setStatus] = useState('');

  // Don't show approval or cancel buttons if the token is ETH
  if (tokenName === 'ETH') {
    return null;
  }

  const tokens = KovanTokens();
  const tokenAddress = tokens.find(token => token.name === tokenName)?.address;

  // Bind MetaMask wallet address to ethers.js
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();

  const handleApprove = async () => {
    if (!ethers.utils.isAddress(tokenAddress)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Token Address',
        text: 'Please check the token address and try again.',
      });
      return;
    }
  
    if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Amount',
        text: 'Please enter a valid amount greater than zero.',
      });
      return;
    }
  
    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function approve(address spender, uint256 amount) public returns (bool)',
      ], signer);
  
      const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18); // Assuming the token has 18 decimals
      const txResponse = await tokenContract.approve('0xD43fCDe867eaFc58eF5E1Bd7A86B93f279fB4757', parsedAmount);
      await txResponse.wait();
      
      Swal.fire({
        icon: 'success',
        title: 'Approve Successful',
        text: 'Your transaction has been successfully approved!',
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Approve failed: ${error.message}`,
      });
    }
  };
  

  const handleCancel = async () => {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, [
        'function approve(address spender, uint256 amount) public returns (bool)',
      ], signer);
  
      // Approving a zero amount effectively cancels previous approvals
      const txResponse = await tokenContract.approve('0xD43fCDe867eaFc58eF5E1Bd7A86B93f279fB4757', 0);
      await txResponse.wait();
      
      Swal.fire({
        icon: 'success',
        title: 'Cancel Successful',
        text: 'Your previous approval has been successfully cancelled.',
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: `Cancel failed: ${error.message}`,
      });
    }
  };
  

  return (
    <div>

      <button onClick={handleApprove}>Approve</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
};

export default TokenApproval;
