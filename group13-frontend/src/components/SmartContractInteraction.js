import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { KovanTokens } from './KovanTokens';
import TokenApproval from './approve';
import Swal from 'sweetalert2';
import logo4 from '../logo4.png';
import './styles.css';
import './style_select.css';


const SmartContractInteraction = ({ contractAddress, contractABI, signer, onDataChange }) => {
  const [leftToken, setLeftToken] = useState('');
  const [leftAmount, setLeftAmount] = useState('');
  const [rightTokens, setRightTokens] = useState([{ name: '', percentage: 0 }]);
  const [status, setStatus] = useState('');
  const [tokens, setTokens] = useState([]); 

  const contract = new ethers.Contract(contractAddress, contractABI, signer);

  useEffect(() => {
    const fetchedTokens = KovanTokens();
    setTokens(Array.isArray(fetchedTokens) ? fetchedTokens : []);
  }, []);

  const notifyDataChange = () => {
    if (onDataChange) {
      onDataChange(leftToken, leftAmount, rightTokens);
    }
  };

  const handleLeftTokenChange = (value) => {
    setLeftToken(value);
    notifyDataChange();
  };

  const handleLeftAmountChange = (value) => {
    setLeftAmount(value);
    notifyDataChange();
  };

  const handleRightTokenChange = (index, name) => {
    const newRightTokens = [...rightTokens];
    newRightTokens[index].name = name;
  
    // Check for duplicate tokens
    const uniqueTokens = new Set(newRightTokens.map(token => token.name));
    if (uniqueTokens.size !== newRightTokens.length) {
      Swal.fire({
        icon: 'warning',
        title: 'Duplicate tokens detected',
        text: 'Duplicate tokens are not allowed',
      });
      return;
    }
  
    setRightTokens(newRightTokens);
    notifyDataChange();
  };
  

  const handleRightTokenPercentageChange = (index, value) => {
    const percentage = parseFloat(value);
    if (percentage < 0) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Percentage cannot be negative',
      });
      return;
    }
    if (percentage > 100) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Percentage cannot be more than 100',
      });
      return;
    }
  
    const newRightTokens = [...rightTokens];
    newRightTokens[index].percentage = percentage || 0;
    setRightTokens(newRightTokens);
    notifyDataChange();
  };
  
  const handleAddRightToken = () => {
    if (rightTokens.length < tokens.length - 1) {
      setRightTokens([...rightTokens, { name: '', percentage: 0 }]);
      notifyDataChange();
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Limit Reached',
        text: 'Cannot add more tokens',
      });
    }
  };
  

  const handleRemoveRightToken = (index) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this token?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const newRightTokens = rightTokens.filter((_, i) => i !== index);
        setRightTokens(newRightTokens);
        notifyDataChange();
        Swal.fire(
          'Removed!',
          'The token has been removed.',
          'success'
        );
      }
    });
  };
  
  const handleExecuteSwap = async () => {
    const totalPercentage = rightTokens.reduce((acc, curr) => acc + curr.percentage, 0);
    if (totalPercentage !== 100) {
      Swal.fire({
        icon: 'error',
        title: 'Incorrect Total Percentage',
        text: 'Total percentage must equal 100',
      });
      return;
    }
  
    if (rightTokens.some(token => token.percentage <= 0)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Token Percentage',
        text: 'All token percentages must be greater than 0',
      });
      return;
    }
  
    try {
      const txResponse = await contract.executeSwap(
        leftToken,
        rightTokens.map(token => token.name),
        ethers.utils.parseEther(leftAmount),
        rightTokens.map(token => token.percentage),
        { value: ethers.utils.parseEther(leftToken === "ETH" ? leftAmount : "0") }
      );
      await txResponse.wait();
      Swal.fire({
        icon: 'success',
        title: 'Swap Executed',
        text: 'Swap executed successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Swap Failed',
        text: `Swap failed: ${error.message}`,
      });
    }
  };
  
  const getAvailableRightTokens = (currentToken) => {
    const selectedRightTokens = new Set(rightTokens.map(token => token.name));
    return tokens.filter(token => (!selectedRightTokens.has(token.name) || token.name === currentToken) && token.name !== leftToken);
  };


  


  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 20px', boxSizing: 'border-box',height: 'calc(100% - 5px)' }}>
        {/* Left tokens */}
        <div style={{ width: '20%', padding: '0 200px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', marginTop: '75px',marginRight: '-40px' }}>
          <select className="select-style" value={leftToken} onChange={e => handleLeftTokenChange(e.target.value)}>
            <option value="">From Token</option>
            {tokens.map(token => (
              <option key={token.address} value={token.name}>{token.name}</option>
            ))}
          </select >
          <input
            className="input-style"
            type="number"
            placeholder="Left Token Amount"
            value={leftAmount}
            onChange={e => handleLeftAmountChange(e.target.value)}
          />
          {leftToken !== 'ETH' && <TokenApproval tokenName={leftToken} amount={leftAmount} />}
        </div>
  


        {/* Swap button and predicted values */}
        <div style={{ width: '30%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={logo4} alt="Execute Swap" className="button-scale" style={{ cursor: 'pointer', width: '200px', height: '200px' }} onClick={handleExecuteSwap} />
          
        </div>
  



        {/* right tokens */}
        <div style={{ width: '50%', padding: '0 20px',flexDirection: 'column',overflowY: 'auto',alignItems: 'center',marginTop: '80px',marginLeft: '100px' }}>
          {rightTokens.map((token, index) => (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'row', // 同样设置为行，让子元素水平排列
              alignItems: 'center', // 垂直居中对齐
              justifyContent: 'space-between', // 元素间保持间距
              marginBottom: '20px' // 为每一行添加底部外边距> 
            }}>  
              <select
                className="select-style2"
                style={{ flex: 1, marginRight: '20px' }} 
                value={token.name}
                onChange={e => handleRightTokenChange(index, e.target.value)}
              >
                <option value="">To Token</option>
                {getAvailableRightTokens(token.name).map(t => (
                  <option key={t.address} value={t.name}>{t.name}</option>
                ))}
              </select>
              <input
                className="input-style2"
                type="number"
                placeholder="Percentage"
                value={token.percentage}
                style={{ flex: 1, marginRight: '10px' }}
                onChange={e => handleRightTokenPercentageChange(index, e.target.value)}
              />
              <button 
              onClick={() => handleRemoveRightToken(index)}
              style={{ marginBottom: '15px' }} 
              >Remove</button>
            </div>
          ))}
          <button onClick={handleAddRightToken}>Add</button>
        </div>
      </div>
      <hr />
    </div>
  );
};
export default SmartContractInteraction;