import React,{ useState } from 'react';
// import WalletConnectComponent from './components/WalletConnectComponent';
// import SmartContractInteraction from './components/SmartContractInteraction';

// import LIApproval from './components/approveli';
import { ethers } from 'ethers';
import './App.css'

import '@fontsource/roboto'; 
import { contractABI, contractAddress } from './utils/contractchange'; 
import WalletPage from './WalletPage';
import SwapPage from './SwapPage';
import LiquidityPage from './LiquidityPage';
import logo4 from './logo4.png'; 
import Votepage from './Vote'
import {useMetamaskState} from './web3/ConnectWallet'
function App() {
    const [currentPage, setCurrentPage] = useState('');
    const { isConnected, account, signer, connectToMetamask } = useMetamaskState();
    const renderPage = () => {
      switch (currentPage) {
        case 'Swap':
          return <SwapPage />;
        case 'liquidity':
          return <LiquidityPage />;
        case 'Vote':
          return <Votepage />;
        default:
          return null;
      }
    };
  
    return (
      
      <div className="App">
        
        <nav style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <button onClick={() => setCurrentPage('')}>Home</button>
          <button onClick={() => setCurrentPage('Swap')}>XSwap</button>
          <button onClick={() => setCurrentPage('liquidity')}>Liquidity</button>
          <button onClick={() => setCurrentPage('Vote')}>Vote</button>
          <button onClick={connectToMetamask} isConnected={isConnected} account={account} signer={signer}>Connect Wallet</button>

        </nav>
        <header>
        {currentPage === '' && (
          <>

            <h1 style={{ fontFamily: 'Poetsen One, sans-serif',fontSize: '80px', marginBottom: '15px',marginTop: '1px' }}>Welcome to XSWAP</h1>
            <img src={logo4} alt="Logo" style={{ width: '400px', marginTop: '20px' }} /> {/* 图片样式 */}
          </>
        )}
      </header>
      {renderPage()}
    </div>
  );
}

export default App;
