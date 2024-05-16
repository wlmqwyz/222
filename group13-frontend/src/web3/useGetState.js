import { ethers } from "ethers";
import { governorContractAddress, governorContractABI } from '../contracts/GovernorContract';


export function useGetState() {


    async function getProposalState(proposalId) {
        try {

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = governorContractAddress;
            const abi = governorContractABI;
            const GovernorContract = new ethers.Contract(contract, abi, provider);
            const value = await GovernorContract.state(proposalId);
            return value.toString();

        } catch {
            console.log("error")
        }
    }


    async function hasVoted(proposalId, voterAddress) {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = governorContractAddress;
            const abi = governorContractABI;
            const GovernorContract = new ethers.Contract(contract, abi, provider);
            const hasVoted = await GovernorContract.hasVoted(proposalId, voterAddress);
            return hasVoted;
        } catch {
            console.log("error checking vote status");
            return false;
        }
    }



    return { getProposalState, hasVoted }
}