import { ethers } from "ethers";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

import { BoxAddress, BoxABI } from '../contracts/Box';
import { governorContractAddress, governorContractABI } from '../contracts/GovernorContract';
import { useLocalStorage } from "../web3/useLocalStorage";

export function useCreateProposal() {
    // State to store the proposal ID, title, description, and value.
    const [proposal, setProposal] = useState();
    const [proposalTitle, setProposalTitle] = useState();
    const [proposalDescription, setProposalDescription] = useState();
    const [proposalValue, setProposalValue] = useState();
    const { setLocalStorage, clearLocalStorage, getLocalStorage } = useLocalStorage();

    // Load saved proposal ID from local storage if it exists.
    useEffect(() => {
        const storedProposalId = getLocalStorage('id');
        if (storedProposalId) {
            setProposal(storedProposalId);
        }
    }, [getLocalStorage]);

    // Function to create a proposal.
    async function createProposal(signer, title, description, value) {
        try {
            // Clear previous proposal data.
            clearLocalStorage();
            const boxContract = BoxAddress;
            const governorContract = governorContractAddress;
            const boxAbi = BoxABI;
            const governorAbi = governorContractABI;
            const governorContractInstance = new ethers.Contract(governorContract, governorAbi, signer);
            const boxInterface = new ethers.utils.Interface(boxAbi);

            // Encode the value as the data for the 'store' function.
            const encodedFunction = boxInterface.encodeFunctionData('store', [value]);

            // Combine the title and description into a single formatted string.
            const formattedDescription = `Title: ${title} | Description: ${description}`;

            // Use the description as the proposal description in the governor contract.
            const proposeTx = await governorContractInstance.propose(
                [boxContract],
                [0],
                [encodedFunction],
                formattedDescription
            );

            // Wait for the transaction to confirm and retrieve the proposal ID.
            const proposeReceipt = await proposeTx.wait(3);
            const proposalId = proposeReceipt.events[0].args.proposalId;
            const bnValue = ethers.BigNumber.from(proposalId);

            // Set state variables with the proposal information.
            setProposal(bnValue.toString());
            setProposalTitle(title);
            setProposalDescription(description);
            setProposalValue(value);

            // Store the proposal ID in local storage.
            setLocalStorage('id', proposalId);
            console.log('id', proposalId);

            Swal.fire({
                icon: 'success',
                title: 'Proposal Submitted',
                text: 'Your proposal has been submitted successfully! Please refresh the page to view.',
            });

        } catch (err) {
            console.error("Failed to submit proposal:", err);
            Swal.fire({
                icon: 'error',
                title: 'Proposal Submission Failed',
                text: 'Failed to submit proposal. Be careful to complete the proposal information.',
            });
        }
    }

    // Log when the proposal ID changes.
    useEffect(() => {
        if (proposal) {
            console.log("New proposal ID is now set:", proposal);
        }
    }, [proposal]);


    // Return the proposal creation function and the current state values.
    return { createProposal, proposal, proposalTitle, proposalDescription, proposalValue };
}
