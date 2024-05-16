import { ethers } from "ethers";
import { useState } from "react";
import Swal from 'sweetalert2';

import { governorContractAddress, governorContractABI } from '../contracts/GovernorContract';


export function useVoteProposal() {

    async function voteInProposal(signer, proposalId, support, reason) {
        try {

            const governorContractInstance = new ethers.Contract(governorContractAddress, governorContractABI, signer);
            const voteTx = await governorContractInstance.castVoteWithReason(proposalId, support, reason)
            const voteReceipt = await voteTx.wait(1)

            Swal.fire({
                icon: 'success',
                title: 'Option Submitted',
                text: 'You have voted successfully!',
            });

        } catch (err) {
            console.log(err)
        }
    }

    return { voteInProposal }

}
