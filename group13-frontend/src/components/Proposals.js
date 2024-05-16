import React, { useState, useEffect } from 'react';
import { useCreateProposal } from '../web3/NewProposal';
import Swal from 'sweetalert2';
import { ethers } from 'ethers';
import { tokenAddress, tokenABI } from '../contracts/BabiToken';

export const Proposals = ({ signer, provider, account }) => {
    const { createProposal } = useCreateProposal();
    const [open, setOpen] = useState(false);
    const [proposalTitle, setProposalTitle] = useState(''); // Title for the proposal
    const [proposalDescription, setProposalDescription] = useState(''); // Description for the proposal
    const [proposalValue, setProposalValue] = useState(''); // Value (number) to be stored
    const [balance, setBalance] = useState('0'); 

    // Handlers for each input change
    const handleProposalTitleChange = (event) => {
        setProposalTitle(event.target.value);
    };

    const handleProposalDescriptionChange = (event) => {
        setProposalDescription(event.target.value);
    };

    const handleProposalValueChange = (event) => {
        setProposalValue(event.target.value);
    };

    // Fetch token balance
    const fetchBalance = async () => {
        if (provider && account) {
            const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
            const balance = await tokenContract.balanceOf(account);
            setBalance(ethers.utils.formatEther(balance));
        }
    };

    // UseEffect to fetch balance when account or provider changes
    useEffect(() => {
        fetchBalance();
    }, [provider, account]);

    // Handle the submission of the new proposal
    const handleSubmit = () => {

        // Submit the proposal using the new title and value
        createProposal(signer, proposalTitle, proposalDescription, proposalValue);
        console.log("Adding new proposal");

        // Close modal after submission
        handleClose();
    };

    const handleOpen = () => {
        if (parseFloat(balance) === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Token is Empty',
                text: 'Please click Delegate Tokens first. If the token count is still zero, go to Liquidity to get tokens.',
            });
            return;
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const modalStyle = {
        display: open ? 'block' : 'none',
        position: 'fixed',
        top: '30%',
        left: '50%',
        transform: 'translate(-50%, -30%)',
        width: '500px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
        padding: '20px',
        zIndex: 1000,
        borderRadius: '10px'
    };

    // Render the proposal form
    return (
        <div style={{ margin: '10px' }}>
            <button onClick={handleOpen} >
                Create New Proposal
            </button>

            <div style={modalStyle}>
                <h2 style={{ color: 'black' }}>Create New Proposal</h2>
                <div>
                    <label style={{ color: 'black' }}>Proposal Title:</label>
                    <input
                        type="text"
                        value={proposalTitle}
                        onChange={handleProposalTitleChange}
                        style={{ width: '90%', padding: '8px', margin: '5px 0' }}
                    />
                </div>
                <div>
                    <label style={{ color: 'black' }}>Proposal Description:</label>
                    <textarea
                        value={proposalDescription}
                        onChange={handleProposalDescriptionChange}
                        style={{ width: '90%', padding: '8px', margin: '5px 0', height: '80px' }}
                    />
                </div>
                <div>
                    <label style={{ color: 'black' }}>Proposal Value:</label>
                    <input
                        type="number"
                        value={proposalValue}
                        onChange={handleProposalValueChange}
                        style={{ width: '90%', padding: '8px', margin: '5px 0' }}
                    />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button onClick={handleClose} >
                        Cancel
                    </button>
                    <button onClick={handleSubmit} >
                        Submit Proposal
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Proposals;
