import React, { useState } from 'react';
import { connectWallet } from '../utils/wallet';

function WalletConnectComponent() {
  const [userAddress, setUserAddress] = useState('');

  const handleConnectWallet = async () => {
    const signer = await connectWallet();
    if (signer) {
      setUserAddress(await signer.getAddress());
    }
  };

  return (
    <div>
      <button onClick={handleConnectWallet}>Connect MetaMask</button>
      {userAddress && <p>Connected Account: {userAddress}</p>}
    </div>
  );
}

export default WalletConnectComponent;
