import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import { useDelegateTokens } from '../web3/DelegateTokens';
import { useGetBalance } from '../web3/GetTokenBalance';
import { tokenAddress, tokenABI } from '../contracts/BabiToken';

import Swal from 'sweetalert2'; // 新增：引入SweetAlert2

function VotingPower({ provider, account, updateVotingPower }) {
  const { delegateTokens, delegateSuccess } = useDelegateTokens();
  const { userBalance, getBalance } = useGetBalance();
  const [displayBalance, setDisplayBalance] = useState('0');
  const [balance, setBalance] = useState('0'); // 新增：用于存储 token 余额

  // Fetch token balance
  const fetchBalance = async () => {
    if (provider && account) {
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const balance = await tokenContract.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  // UseEffect to fetch balance when account or provider changes
  useEffect(() => {
    fetchBalance();
  }, [provider, account]);

  const handleDelegateClick = async () => {
    if (parseFloat(balance) === 0) { // 新增：检查余额是否为0
      Swal.fire({
        icon: 'warning',
        title: 'Token is Empty',
        text: 'Please click Delegate Tokens first. If the token count is still zero, go to Liquidity to get tokens.',
      });
      return;
    }
    console.log("Attempting to delegate...");
    await delegateTokens(provider.getSigner(), account);
    console.log("Delegate attempted:", delegateSuccess);
  };

  useEffect(() => {
    if (delegateSuccess && account) {
      getBalance(account);
      console.log("Fetching balance for account:", account);
    }
  }, [delegateSuccess, account, getBalance]);

  useEffect(() => {
    if (delegateSuccess) {
      console.log("Setting display balance:", userBalance);
      setDisplayBalance(userBalance);
      updateVotingPower(userBalance);
    }
  }, [userBalance, delegateSuccess, updateVotingPower]);

  return (
    <div style={{ padding: '10px', margin: '10px' }}>
      <h2>Voting Power</h2>
      <div style={{ marginBottom: '10px' }}>
        <p>Your Voting Power: {displayBalance}</p>
      </div>
      <div>
        <button onClick={handleDelegateClick}>Delegate Vote</button>
      </div>
      <hr style={{ backgroundColor: 'gray', height: '2px', marginTop: '10px' }} />
    </div>
  );
}

export default VotingPower;
