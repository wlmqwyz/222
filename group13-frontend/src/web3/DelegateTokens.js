import { ethers } from "ethers";
import { useState } from "react";
import { tokenAddress, tokenABI } from '../contracts/BabiToken';

export function useDelegateTokens() {
    const [isDelegating, setIsDelegating] = useState(false);
    const [delegateSuccess, setDelegateSuccess] = useState(false);
    const [error, setError] = useState("");

    async function delegateTokens(signer, delegateeAddress) {
        setIsDelegating(true);
        setDelegateSuccess(false);
        setError("");

        try {
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
            const transaction = await tokenContract.delegate(delegateeAddress);
            await transaction.wait();
            setDelegateSuccess(true);
            console.log("Tokens successfully delegated");
        } catch (err) {
            console.error("Error delegating tokens:", err);
            setError("Error delegating tokens: " + err.message);
        } finally {
            setIsDelegating(false);
        }
    }

    return { delegateTokens, isDelegating, delegateSuccess, error };
}
