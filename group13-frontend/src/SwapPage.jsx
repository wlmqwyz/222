import React from 'react';
// import WalletConnectComponent from './components/WalletConnectComponent';
import SwapInterface from './components/exchange';
import { contractABI, contractAddress } from './utils/contractchange';
import { ethers } from 'ethers';
import './components/styles.css'

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

function SwapPage() {
  return (
    <div>
      <h2 class="xswap-heading">XSwap</h2>
      {/* <WalletConnectComponent /> */}
      <SwapInterface
        contractAddress={contractAddress}
        contractABI={contractABI}
        signer={signer}
      />
    </div>


  );
}

export default SwapPage;


