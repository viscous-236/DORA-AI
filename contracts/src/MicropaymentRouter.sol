// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

contract MicropaymentRouter {
   event DraftAnalysisPaid(address indexed payer, string daoId);
    event ProposalAnalysisPaid(address indexed payer, string daoId, string proposalId);

    uint256 public draftFee;
    uint256 public proposalFee;
    address public owner;

    constructor(uint256 _draftFee, uint256 _proposalFee) {
        owner = msg.sender;
        draftFee = _draftFee;
        proposalFee = _proposalFee;
    }

    function payForDraftAnalysis(string calldata daoId) external payable {
        require(msg.value == draftFee, "wrong fee");
        emit DraftAnalysisPaid(msg.sender, daoId);
    }

    function payForProposalAnalysis(string calldata daoId, string calldata proposalId) external payable {
        require(msg.value == proposalFee, "wrong fee");
        emit ProposalAnalysisPaid(msg.sender, daoId, proposalId);
    }
}