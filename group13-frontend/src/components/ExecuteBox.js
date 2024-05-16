import { useEffect, useState } from 'react';
import { useGetState } from '../web3/useGetState';
import { ethers } from 'ethers';
import { useExecuteProposal } from '../web3/ExecuteProposal';

export const ExecuteProposal = ({ lastId, signer, value, title, description }) => {
    const { getProposalState } = useGetState();
    const [proposalState, setProposalState] = useState(null);
    const { queueProposal, executeProposal } = useExecuteProposal();

    const getTheState = async () => {
        const state = await getProposalState(lastId);
        setProposalState(state);
    }

    useEffect(() => {
        getTheState();
    }, [proposalState])

    const handleVotingState = (e) => {
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
        return status[e] ?? "Unknown";
    }

    const shortId = lastId ? lastId.slice(0, 11) + "..." : "N/A";

    return (
        <div>
            <div style={{ marginBottom: '10px', color: 'gray', fontSize: '14px' }}>
                Current/Latest Voting
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '20px' }}>
                {shortId}
            </div>
            <div style={{ marginBottom: '10px', color: 'gray' }}>
                The Proposal state is {handleVotingState(proposalState)}
            </div>
            {
                handleVotingState(proposalState) === "Succeeded" ?
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => queueProposal(signer, value, title, description)}>Queue</button>
                </div> :
                handleVotingState(proposalState) === "Queued" ?
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => executeProposal(signer, value, title, description)}>Execute</button>
                </div> :
                handleVotingState(proposalState) === "Active" ? 
                <div> Voting Process Still active </div> :
                handleVotingState(proposalState) === "Defeated" ?
                <div> The Proposal has failed wait until a new one</div> :
                <div> You can't execute now!</div>
            }
        </div>
    )
}