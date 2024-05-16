import { useState, useEffect } from 'react';
import { useGetState } from '../web3/useGetState';
import { useVoteProposal } from '../web3/VoteProposal';
import { ethers } from 'ethers';
import { governorContractAddress, governorContractABI } from '../contracts/GovernorContract';
import Swal from 'sweetalert2';

export const Vote = ({ signer, votingPower }) => {
    const [proposalIdInput, setProposalIdInput] = useState('');
    const [proposal, setProposal] = useState(null);
    const [proposalState, setProposalState] = useState(null);
    const [voteReason, setVoteReason] = useState('');
    const [voteOption, setVoteOption] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [showVoteDialog, setShowVoteDialog] = useState(false);
    const [showProposalDialog, setShowProposalDialog] = useState(false);

    const { getProposalState, hasVoted } = useGetState();
    const { voteInProposal } = useVoteProposal();

    const provider = new ethers.providers.InfuraProvider('homestead', 'YOUR_INFURA_PROJECT_ID');
    const governorContract = new ethers.Contract(governorContractAddress, governorContractABI, provider);

    const handleVotingState = (stateCode) => {
        const status = {
            "0": "Pending",
            "1": "Active",
            "2": "Canceled",
            "3": "Defeated",
            "4": "Succeeded",
            "5": "Queued",
            "6": "Expired",
            "7": "Executed"
        };
        return status[stateCode] ?? "Unknown";
    };

    const handleValidateProposalId = async () => {
        if (proposalIdInput.trim()) {
            const alreadyVoted = await hasVoted(proposalIdInput, signer.getAddress());
            if (alreadyVoted) {
                Swal.fire({
                    icon: 'error',
                    title: 'Already Voted',
                    text: 'You have already voted on this proposal.',
                });
            } else {
                getTheState(proposalIdInput);
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Empty Proposal ID',
                text: 'Proposal ID cannot be empty.',
            });
        }
    };

    const getTheState = async (proposalId) => {
        try {
            const stateCode = await getProposalState(proposalId);
            if (stateCode !== null && stateCode !== undefined) {
                setProposalState(stateCode);
                setProposal(proposalId);
                setShowVoteDialog(false);
                setShowProposalDialog(true);
                setErrorMessage('');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid Proposal ID',
                    text: 'Proposal ID is invalid. Please confirm again.',
                });
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Proposal ID',
                text: 'Proposal ID is invalid. Please confirm again.',
            });
        }
    };

    const handleVoteReason = (e) => {
        setVoteReason(e.target.value);
    };

    const handleVoteOption = (option) => {
        setVoteOption(option);
    };

    const handleConfirmVote = async () => {
        if (!voteReason.trim() || voteOption === null) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Information',
                text: 'Please select a voting option and provide a reason for your vote.',
            });
            return;
        }
        try {
            await voteInProposal(signer, proposal, voteOption, voteReason);
            setShowProposalDialog(false);

        } catch (error) {
            console.error("Error while voting:", error);
            Swal.fire({
                icon: 'error',
                title: 'Vote Failed',
                text: 'Failed to cast vote. Check console for details.',
            });
        }
    };

    const getButtonStyle = (option) => {
        return {
            backgroundColor: voteOption === option ? '#d980fa' : '', 
            padding: '10px 20px',
            margin: '0 5px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            cursor: 'pointer',
        };
    };

    const handleVoteDialogToggle = () => {
        if (parseInt(votingPower, 10) > 0) {
            setShowVoteDialog(!showVoteDialog);
            setErrorMessage('');
            setProposalIdInput('');
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'No Voting Rights',
                text: 'Please click Delegate Vote first.',
            });
        }
    };

    const handleProposalDialogClose = () => {
        setShowProposalDialog(false);
    };

    return (
        <div>
            <p>Delegate your tokens to participate in governance and cast your votes on important proposals.</p>
            <button style={{ width: '180px', padding: '10px 20px' }} onClick={handleVoteDialogToggle}>Vote Proposal</button>

            {showVoteDialog && (
                <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: 1000, borderRadius: '10px' }}>
                    <h2 style={{ color: 'black' }}>Enter Proposal ID</h2>
                    {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
                    <input type="text" value={proposalIdInput} onChange={(e) => setProposalIdInput(e.target.value)} placeholder="Proposal ID" style={{ width: '100%', marginBottom: '10px' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <button onClick={handleVoteDialogToggle}>Cancel</button>
                        <button onClick={() => {
                            handleValidateProposalId();
                        }}>Continue</button>
                    </div>
                </div>
            )}

            {showProposalDialog && (
                <div style={{ position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -30%)', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', zIndex: 1000, borderRadius: '10px' }}>
                    <h2 style={{ color: 'black' }}>Vote on Proposal</h2>
                    <div>
                        <p style={{ color: 'black' }}>Proposal ID: {proposal ? proposal.slice(0, 11) + "..." : "N/A"}</p>
                        <p style={{ color: 'black' }}>The Proposal state is {handleVotingState(proposalState)}.</p>
                    </div>
                    {handleVotingState(proposalState) === "Active" && parseInt(votingPower, 10) > 0 ? (
                        <>
                            <input type="text" placeholder="Reason" value={voteReason} onChange={handleVoteReason} style={{ width: '100%', marginBottom: '10px' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <button style={getButtonStyle(1)} onClick={() => handleVoteOption(1)}>Support</button>
                                <button style={getButtonStyle(0)} onClick={() => handleVoteOption(0)}>Against</button>
                                <button style={getButtonStyle(2)} onClick={() => handleVoteOption(2)}>Abstain</button>
                            </div>
                            <button onClick={handleConfirmVote}>Confirm Vote</button>
                        </>
                    ) : (
                        <p style={{ color: 'red' }}>Voting is not available due to inactive proposal.</p>
                    )}
                    <button onClick={handleProposalDialogClose}>Close</button>
                </div>
            )}
        </div>
    );
};

export default Vote;
