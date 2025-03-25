// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PolkadotDAO is ERC20 {
    struct Proposal {
        string description;
        uint voteCount;
        bool executed;
        address proposer;
        uint deadline;  // New: When voting ends
    }

    mapping(address => uint) public memberTokens;  // New: Tracks token ownership
    mapping(address => mapping(uint => bool)) public hasVoted;  // New: Prevents double voting
    Proposal[] public proposals;
    uint public totalMembers;

    // Constructor now mints tokens to initial members
    constructor(address[] memory initialMembers) ERC20("DAOToken", "DAO") {
        for (uint i = 0; i < initialMembers.length; i++) {
            memberTokens[initialMembers[i]] = 100;  // Give each 100 tokens
            _mint(initialMembers[i], 100 * 10**18);  // Mint ERC20 tokens (18 decimals)
        }
        totalMembers = initialMembers.length;
    }

    modifier onlyMember() {
        require(memberTokens[msg.sender] > 0, "Only token holders can do this!");
        _;
    }

    // Add a member by giving them tokens
    function addMember(address newMember, uint tokenAmount) public onlyMember {
        require(memberTokens[newMember] == 0, "Already a member!");
        memberTokens[newMember] = tokenAmount;
        totalMembers++;
        _mint(newMember, tokenAmount * 10**18);
    }

    // Propose with a deadline (e.g., 3 days from now)
    function propose(string memory description) public onlyMember {
        uint votingDeadline = block.timestamp + 3 days;  // New: Deadline in seconds
        proposals.push(Proposal({
            description: description,
            voteCount: 0,
            executed: false,
            proposer: msg.sender,
            deadline: votingDeadline
        }));
    }

    // Vote with token weight
    function vote(uint proposalId) public onlyMember {
        require(proposalId < proposals.length, "Invalid proposal ID!");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp < proposal.deadline, "Voting has ended!");
        require(!proposal.executed, "Already executed!");
        require(!hasVoted[msg.sender][proposalId], "Already voted!");

        uint voterTokens = memberTokens[msg.sender];
        proposal.voteCount += voterTokens;  // New: Votes scale with tokens
        hasVoted[msg.sender][proposalId] = true;
    }

    // Execute if majority tokens approve
    function executeProposal(uint proposalId) public onlyMember {
        require(proposalId < proposals.length, "Invalid proposal ID!");
        Proposal storage proposal = proposals[proposalId];
        require(block.timestamp >= proposal.deadline, "Voting still active!");
        require(!proposal.executed, "Already executed!");
        require(proposal.voteCount > totalSupply() / 2, "Not enough votes!");

        proposal.executed = true;
        // Add execution logic here (e.g., send funds)
    }

    function getProposalCount() public view returns (uint) {
        return proposals.length;
    }
}