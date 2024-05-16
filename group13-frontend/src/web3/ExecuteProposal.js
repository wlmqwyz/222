import { ethers } from "ethers";

import { BoxAddress, BoxABI } from '../contracts/Box';
import { governorContractAddress, governorContractABI } from '../contracts/GovernorContract';


export function useExecuteProposal() {

    async function queueProposal(signer, value, description) {
        try {
            const boxContract = BoxAddress;
            const boxAbi = BoxABI;
            const GovernorContractInstance = new ethers.Contract(governorContractAddress,governorContractABI, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);
            const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description))
            const queueTx = await GovernorContractInstance.queue([boxContract], [0], [encodedFunction], descriptionHash)
            const proposeReceipt = await queueTx.wait(5)

        } catch (err) {
            console.log(err)
        }
    }

    async function executeProposal(signer, value, description) {
        try {
            const boxContract = BoxAddress;
            const boxAbi = BoxABI;
            const GovernorContractInstance = new ethers.Contract(governorContractAddress,governorContractABI, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);
            const descriptionHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(description))
            // const hexHash = ethers.utils.hexlify(descriptionHash)

            const executeTx = await GovernorContractInstance.execute([boxContract], [0], [encodedFunction], descriptionHash)
            const proposeReceipt = await executeTx.wait(5)

        } catch (err) {
            console.log(err)
        }

    }

    return { queueProposal, executeProposal }

}