import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Swal from 'sweetalert2';
import { governorContractAddress, governorContractABI } from '../contracts/GovernorContract';
import { TimeLockAddress, TimeLockABI } from '../contracts/TimeLock';
import { useExecuteProposal } from '../web3/ExecuteProposal';
import { Pie } from 'react-chartjs-2';
import 'chart.js/auto';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

function ProposalBox({ signer, proposals }) {
  const [visibleDescriptionId, setVisibleDescriptionId] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});
  const [timeLock, setTimeLock] = useState();
  const { queueProposal, executeProposal } = useExecuteProposal();

  useEffect(() => {
    if (signer) {
      const contract = new ethers.Contract(TimeLockAddress, TimeLockABI, signer);
      setTimeLock(contract);
    }
  }, [signer]);

  useEffect(() => {
    const fetchVoteCounts = async () => {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(governorContractAddress, governorContractABI, provider);

      for (let proposal of proposals) {
        const votes = await contract.proposalVotes(proposal.id);
        setVoteCounts((prevVoteCounts) => ({
          ...prevVoteCounts,
          [proposal.id]: {
            againstVotes: ethers.utils.formatEther(votes.againstVotes),
            forVotes: ethers.utils.formatEther(votes.forVotes),
            abstainVotes: ethers.utils.formatEther(votes.abstainVotes),
          },
        }));
      }
    };

    fetchVoteCounts();
  }, [proposals]);

  const toggleDescription = (id) => {
    setVisibleDescriptionId(visibleDescriptionId === id ? null : id);
  };

  const createDocument = (title, description) => {
    return `Title: ${title}\nDescription: ${description}`;
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    Swal.fire({
      icon: 'success',
      title: 'Copied Proposal ID',
      text: 'Now you can vote!',
    });
  };

  const truncateId = (id) => {
    if (id.length > 10) {
      return `${id.slice(0, 5)}...${id.slice(-4)}`;
    }
    return id;
  };

  const handleMinDelay = (proposal) => {
    setTimeout(() => {
      proposal.state = "Queued";
    }, proposal.minDelay * 1000);
  };

  const hrStyle = {
    backgroundColor: 'gray',
    height: '1.2px',
    border: 'none',
    margin: '30px 0',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  };

  const renderVoteChart = (votes) => {
    const data = {
      labels: ['Support', 'Against', 'Abstain'],
      datasets: [
        {
          data: [votes.forVotes, votes.againstVotes, votes.abstainVotes],
          backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
          hoverBackgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
        },
        tooltip: {
          callbacks: {
            label: function(tooltipItem) {
              const label = data.labels[tooltipItem.dataIndex] || '';
              const value = data.datasets[0].data[tooltipItem.dataIndex];
              return `${label}: ${value}`;
            },
          },
        },
      },
    };

    return (
      <div style={{ height: '200px', width: '200px', margin: '0 auto' }}>
        <Pie data={data} options={options} />
      </div>
    );
  };


  return (
    <div>
      {proposals.map((proposal) => (
        <div key={proposal.id} style={{ marginBottom: '10px', padding: '10px', borderRadius: '8px' }}>
          <div onClick={() => toggleDescription(proposal.id)} style={{ cursor: 'pointer' }}>
            <h3>
              Proposal ID: {truncateId(proposal.id)}
              <button onClick={(e) => { e.stopPropagation(); copyToClipboard(proposal.id); }} style={{ marginLeft: '20px', backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>Copy</button>
            </h3>
            {proposal.state === "Succeeded" ? (
              <div>
                <button style={{ marginLeft: 'auto' }} disabled={true}>Queuing</button>
                {handleMinDelay(proposal)}
              </div>
            ) : proposal.state === "Queued" ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button onClick={() => {
                  executeProposal(signer, proposal.value, createDocument(proposal.title, proposal.description));
                }}>Execute</button>
              </div>
            ) : null}
            <h3>Title: {proposal.title}</h3>
            <h4 style={{ color: 'gray' }}>State: {proposal.state}</h4>
          </div>
          {visibleDescriptionId === proposal.id && (
            <div>
              <p>Description: {proposal.description}</p>
              {voteCounts[proposal.id] && (
                <div>
                  {renderVoteChart(voteCounts[proposal.id])}
                </div>
              )}
            </div>
          )}
          <hr style={hrStyle} />
        </div>
      ))}
    </div>
  );
}

export default ProposalBox;
