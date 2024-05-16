import { ethers } from 'ethers';

export async function connectWallet() {
  if (typeof window.ethereum !== 'undefined') {
    try {
      // 请求用户授权连接钱包
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      console.log("Account:", await signer.getAddress());
      return signer;
    } catch (error) {
      console.error("User denied account access");
    }
  } else {
    console.log("MetaMask is not installed!");
  }
}
