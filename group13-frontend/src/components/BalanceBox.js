import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { tokenAddress, tokenABI } from '../contracts/BabiToken';

function BalanceBox({ provider, account }) {
  const [balance, setBalance] = useState('0');

  const fetchBalance = async () => {
    if (provider && account) {
      const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
      const balance = await tokenContract.balanceOf(account);
      setBalance(ethers.utils.formatEther(balance));
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [provider, account]);

  return (
    <div>
      <h2>BabiBalance</h2>
      <p>{balance} Tokens</p>
      <hr style={{ backgroundColor: 'gray', height: '1px' }} />
    </div>
  );
}

export default BalanceBox;

