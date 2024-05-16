import { ethers } from "ethers";
import { useState } from "react";
import { tokenAddress, tokenABI } from '../contracts/BabiToken';

export function useGetBalance() {
    const [userBalance, setUserBalance] = useState();

    async function getBalance(walletAddress) {
        if (!window.ethereum || !walletAddress) return;

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
            const balance = await tokenContract.balanceOf(walletAddress);
            setUserBalance(ethers.utils.formatEther(balance)); // Format the balance for readability
        } catch (err) {
            console.error("Failed to fetch balance:", err);
        }
    }

    return { userBalance, getBalance };
}

