import React, { useState } from 'react';
import { ethers } from 'ethers';
import SmartContractInteraction from './SmartContractInteraction';
import Swal from 'sweetalert2';
import './exchange.css'; // 确保路径正确

const SwapInterface = ({ contractAddress, contractABI }) => {
  const [result, setResult] = useState([]);
  const [rightTokens, setRightTokens] = useState([]);
  const [leftToken, setLeftToken] = useState(''); // 状态用于存储左侧代币标识
  const [leftAmount, setLeftAmount] = useState(''); // 状态用于存储左侧代币数量

  // 触发计算的函数，现在绑定到按钮点击事件
  const handleCalculate = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const rightNamesArray = rightTokens.map(token => token.name);
      const percentagesArray = rightTokens.map(token => token.percentage);

      const predictedValue = await contract.all(
        leftToken,
        rightNamesArray,
        ethers.utils.parseEther(leftAmount),
        percentagesArray
      );

      const floatValues = predictedValue.map((item, index) => {
        const ethValue = ethers.utils.formatEther(item._hex);
        return { name: rightNamesArray[index], value: parseFloat(parseFloat(ethValue).toFixed(3)) };
      });

      setResult(floatValues);
      setRightTokens(rightTokens);
      Swal.fire({
        icon: 'success',
        title: 'Calculation Successful',
        text: 'The token values have been calculated and updated successfully.'
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Calculation Failed',
        text: `Error during calculation: ${error.message}`
      });
    }
  };

  return (
    <div>
      <SmartContractInteraction
        contractAddress={contractAddress}
        contractABI={contractABI}
        signer={new ethers.providers.Web3Provider(window.ethereum).getSigner()}
        onDataChange={(token, amount, tokens) => {
          setLeftToken(token);
          setLeftAmount(amount);
          setRightTokens(tokens);
        }}
      />
      <div className="container">
      <button onClick={handleCalculate}>Calculate Values</button>
      
      {result.length > 0 ? (
        <table className="custom-table">
          <thead>
            <tr>
              <th>Token Name</th>
              <th>Value (ETH)</th>
            </tr>
          </thead>
          <tbody>
            {result.map((token, index) => (
              <tr key={index}>
                <td>{token.name}</td>
                <td>≈ {token.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No values to display.</p>
      )}</div>
    </div>
    
  );
};


export default SwapInterface;
