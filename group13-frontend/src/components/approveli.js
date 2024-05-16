import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { Tokens } from './Tokens';
import './style_select.css'
import './styles.css'
const LIApproval = () => {
  const [selectedToken, setSelectedToken] = useState('');
  const [ethAmount, setEthAmount] = useState('');
  const [calculatedTokenAmount, setCalculatedTokenAmount] = useState('');
  const [lpAmount, setLpAmount] = useState('');
  const [lpTokenBalance, setLpTokenBalance] = useState('');
  const [operation, setOperation] = useState('add');

  const tokens = Tokens();
  const selectedTokenData = tokens.find(token => token.name === selectedToken);

  useEffect(() => {
    if (operation === 'add') {
      calculateTokenAmount();
    } else if (operation === 'remove') {
      getLpTokenBalance();
    }
  }, [ethAmount, selectedToken, operation]);

  const calculateTokenAmount = async () => {
    if (!selectedTokenData || !selectedTokenData.pooladdress || !ethAmount) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const liquidityContract = new ethers.Contract(selectedTokenData.pooladdress, [
        'function getReserve() public view returns (uint256)',
      ], signer);

      const ethReserve = await provider.getBalance(selectedTokenData.pooladdress);
      const tokenReserve = await liquidityContract.getReserve();
      const ethValue = ethers.utils.parseEther(ethAmount || '0');

      if (ethReserve.sub(ethValue).gt(0)) {
        const tokenAmountRequired = ethValue.mul(tokenReserve).div(ethReserve.sub(ethValue));
        setCalculatedTokenAmount(ethers.utils.formatUnits(tokenAmountRequired, 18));
      } else {
        setCalculatedTokenAmount('');
      }
    } catch (error) {
      console.error('Error:', error);
      setCalculatedTokenAmount('');
    }
  };

  const getLpTokenBalance = async () => {
    if (!selectedTokenData || !selectedTokenData.pooladdress) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const liquidityContract = new ethers.Contract(selectedTokenData.pooladdress, [
        'function balanceOf(address account) public view returns (uint256)',
      ], signer);

      const balance = await liquidityContract.balanceOf(await signer.getAddress());
      setLpTokenBalance(ethers.utils.formatUnits(balance, 18));
    } catch (error) {
      console.error('Error:', error);
      setLpTokenBalance('0');
    }
  };

  const handleApprove = async () => {
    if (!selectedTokenData || !selectedTokenData.address || !selectedTokenData.pooladdress) {
      Swal.fire('Invalid token selection', '', 'error');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const tokenContract = new ethers.Contract(selectedTokenData.address, [
        'function approve(address spender, uint256 amount) public returns (bool)',
      ], signer);

      const parsedAmount = ethers.utils.parseUnits(calculatedTokenAmount, 18);
      const txResponse = await tokenContract.approve(selectedTokenData.pooladdress, parsedAmount);
      await txResponse.wait();
      Swal.fire('Approve successful', '', 'success');
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Approve failed', `${error.message}`, 'error');
    }
  };

  const handleAddLiquidity = async () => {
    if (!selectedTokenData || !selectedTokenData.pooladdress) {
      Swal.fire('Invalid token selection', '', 'error');
      return;
    }

    if (isNaN(parseFloat(calculatedTokenAmount)) || parseFloat(calculatedTokenAmount) <= 0) {
      Swal.fire('Invalid token amount', '', 'error');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const liquidityContract = new ethers.Contract(selectedTokenData.pooladdress, [
        'function addLiquidity(uint256 amount) public payable returns (uint256)',
      ], signer);

      const parsedTokenAmount = ethers.utils.parseUnits(calculatedTokenAmount, 18);
      const parsedEthAmount = ethers.utils.parseEther(ethAmount);

      const txResponse = await liquidityContract.addLiquidity(parsedTokenAmount, { value: parsedEthAmount });
      await txResponse.wait();
      Swal.fire('Add liquidity successful', '', 'success');
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Add liquidity failed', `${error.message}`, 'error');
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!selectedTokenData || !selectedTokenData.pooladdress) {
      Swal.fire('Invalid token selection', '', 'error');
      return;
    }

    const lpAmountParsed = parseFloat(lpAmount);
    if (isNaN(lpAmountParsed) || lpAmountParsed <= 0) {
      Swal.fire('Invalid LP token amount', '', 'error');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const liquidityContract = new ethers.Contract(selectedTokenData.pooladdress, [
        'function removeLiquidity(uint256 amount) public returns (uint256, uint256)',
      ], signer);

      const parsedLpAmount = ethers.utils.parseUnits(lpAmount, 18);
      const txResponse = await liquidityContract.removeLiquidity(parsedLpAmount);
      await txResponse.wait();
      Swal.fire('Remove liquidity successful', '', 'success');
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Remove liquidity failed', `${error.message}`, 'error');
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: operation === 'add' ? '#4CAF50' : '#888', fontWeight: 'bold',marginBottom: '100px', fontSize:'24px' }}>Add Liquidity</span>
          <div onClick={() => setOperation(operation === 'add' ? 'remove' : 'add')} style={{
            width: '50px',
            height: '25px',
            backgroundColor: operation === 'add' ? '#4CAF50' : '#FF6347',
            borderRadius: '25px',
            cursor: 'pointer',
            position: 'relative'
          }}>
            <div style={{

              width: '22px',
              height: '22px',
              borderRadius: '50%',
              backgroundColor: 'white',
              position: 'absolute',
              top: '1.5px',
              transition: 'all 0.3s ease',
              left: operation === 'add' ? '1.5px' : 'calc(100% - 23.5px)' // 动态位置
            }} />
          </div>
          <span style={{ color: operation === 'remove' ? '#FF6347' : '#888', fontWeight: 'bold',marginBottom: '100px',fontSize:'24px'}}>Remove Liquidity</span>
        </div>
      </div>
      <select
        className="select-style3"
        style={{ flex: 1, marginRight: '20px', marginBottom: '20px' }}
        value={selectedToken}
        onChange={(e) => setSelectedToken(e.target.value)}
      >
        <option value="" disabled>Select a token</option>
        {tokens.map(token => (
          <option key={token.name} value={token.name}>
            {token.name}
          </option>
        ))}
      </select>
      {operation === 'add' ? (
        <>
          <input
            className="select-style3"
            type="text"
   
            placeholder="ETH Amount"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          {calculatedTokenAmount && <div style={{ fontWeight: 'bold' }}>Token Amount: {calculatedTokenAmount}</div>}
          <button 
            onClick={handleApprove}
            style={{ marginLeft: '20px', marginTop: '10px' }} 
          >
            Approve
          </button>
          <button 
            onClick={handleAddLiquidity}
            style={{ marginLeft: '16px', marginTop: '10px' }} 
          >
            Add Liquidity
          </button>
        </>
      ) : (
        <>
          <div style={{ fontWeight: 'bold', marginBottom: '20px' }}>BABI Token Balance: {lpTokenBalance}</div>
          <input
            className="select-style3"
            type="text"
            placeholder="BABI Amount"
            value={lpAmount}
            onChange={(e) => setLpAmount(e.target.value)}
            style={{ marginBottom: '10px' }}
          />
          <button 
            onClick={handleRemoveLiquidity}
            style={{ marginTop: '10px' }}
          >
            Remove Liquidity
          </button>
        </>
      )}
    </div>
  );
};

export default LIApproval;
