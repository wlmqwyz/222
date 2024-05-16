import { ethers } from "ethers";
import { useState } from "react";

import { BoxAddress, BoxABI } from '../contracts/Box';


export function useGetValue() {
    const [boxValue, setBoxValue] = useState();

    async function getValue() {
        try {

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = BoxAddress;
            const abi = BoxABI;
            const BoxContract = new ethers.Contract(contract, abi, provider);
            const value = await BoxContract.retrieve();
            setBoxValue(value.toString());
        } catch {
            console.log("error")
        }

    }


    return { boxValue, getValue }
}