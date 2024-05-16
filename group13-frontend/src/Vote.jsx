import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import Header from './components/Header';
import BalanceBox from './components/BalanceBox';
import ProposalBox from './components/ProposalBox';
import Propose from './components/Proposals';
import VotingPower from './components/VotingPower';
import Vote from './components/Vote';

import { useMetamaskState } from './web3/ConnectWallet';
import { useGetValue } from './web3/GetCurrentValue';
import { useCreateProposal } from './web3/NewProposal';
import { useGetBalance } from './web3/GetTokenBalance';
import { useGetState } from './web3/useGetState';

import { governorContractAddress, governorContractABI } from './contracts/GovernorContract';


function handleVotingState(stateCode) {
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
}


function Votepage() {
  const [provider, setProvider] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [votingPower, setVotingPower] = useState('0');

  const updateVotingPower = (newPower) => {
    setVotingPower(newPower);
  };

  const { boxValue, getValue } = useGetValue();
  const { isConnected, account, signer, connectToMetamask } = useMetamaskState();
  const { createProposal, proposal, proposalTitle, proposalDescription, proposalValue } = useCreateProposal();
  const { userBalance, getBalance } = useGetBalance();
  const { getProposalState } = useGetState();

  useEffect(() => {
    if (window.ethereum) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    }
  }, []);

  useEffect(() => {
    if (account) {
        getBalance(account); // Fetch balance for the current account
    }
  }, [account]);


  const fetchProposals = async (signer) => {
    try {
      const governorContract = new ethers.Contract(governorContractAddress, governorContractABI, signer);
      // Create an empty array to hold fetched proposals
      const fetchedProposals = [];
      // Fetch proposal creation events
      const proposalEvents = await governorContract.queryFilter("ProposalCreated");
      // Iterate over each event and extract proposal details
      for (const event of proposalEvents) {
        const { proposalId, description } = event.args;
        const state = await getProposalState(proposalId);
        // Safeguard against missing or malformed descriptions
        if (!description || !description.includes('|')) {
          console.error(`Malformed description for Proposal ID: ${proposalId}`);
          continue;
        }
        // Assuming the title is embedded in the description with a specific format
        const [titleLine, descriptionLine] = description.split('|');
        // Extract and sanitize data
        const title = titleLine.replace('Title: ', '').trim();
        const descriptionText = descriptionLine.replace('Description: ', '').trim();
        // Add the proposal to the fetched proposals array
        fetchedProposals.push({
          id: proposalId.toString(),
          title,
          description: descriptionText,
          state: handleVotingState(state)
        });
      }

    return fetchedProposals;
  } catch (error) {
    console.error("Error fetching proposals:", error);
    return [];
  }
};


  useEffect(() => {
    if (signer) {
      fetchProposals(signer).then(setProposals);
    }
  }, [signer]);

  return (
    <div>
      <div style={{ position: 'absolute', top: '10px', right: '50px' }}>
        <Header connectToMetamask={connectToMetamask} isConnected={isConnected} account={account} signer={signer} />
      </div>
        <div style={{ marginTop: '40px' }}> 
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', margin: '10px', width: '400px', height: 70}}>
              <div style={{ marginBottom: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' , border: '1.5px solid gray', padding: '10px', borderRadius: '8px', fontSize: '14px' }}>
                <BalanceBox provider={provider} account={account} />
                <Propose signer={signer} provider={provider} account={account} createProposal={createProposal} proposal={proposal} proposalTitle={proposalTitle} proposalDescription={proposalDescription} proposalValue={proposalValue}/>
                <VotingPower provider={provider} account={account} updateVotingPower={updateVotingPower} />
                <Vote signer={signer} votingPower={votingPower} />
              </div>
            </div>
            <div style={{ width: '700px', height: '70vh', overflowY: 'scroll', margin: '20px',  border: '1.5px solid gray', padding: '10px', marginTop: '9px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
              <ProposalBox signer={signer} proposals={proposals} />
            </div>
          </div>
        </div>  
      </div>
  );
}

export default Votepage;
