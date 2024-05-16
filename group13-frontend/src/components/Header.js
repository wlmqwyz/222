import React, { useState } from 'react';


export const Header = ({ isConnected, account, signer, connectToMetamask }) => {

  return (
    <div>
      <button onClick={connectToMetamask}>
        Delegate Tokens
      </button>
    </div>
  );
}

export default Header;
