import { useState } from 'react';
import { Web3Provider } from '@ethersproject/providers';

export function useMetamaskState() {

    const [isConnected, setIsConnected] = useState(false);
    const [account, setAccount] = useState();
    const [signer, setSigner] = useState();

    async function connectToMetamask() {
        try {
            
            const provider = new Web3Provider(window.ethereum);
            const acc = await provider.send('eth_requestAccounts', []);
            console.log("Connected accounts:", acc);
    
            const sign = provider.getSigner(acc[0]);
            console.log("Signer address:", await sign.getAddress());
    
            setIsConnected(true);
            setAccount(acc[0]);
            setSigner(sign);
    
        } catch (err) {
            console.error("Failed to connect Metamask", err);
        }
    }

    return { isConnected, account, signer, connectToMetamask };

}