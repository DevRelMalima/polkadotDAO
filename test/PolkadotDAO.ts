import { expect } from "chai";
import { ethers } from "hardhat";
import { parseEther } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers"; // For time manipulation

describe("PolkadotDAO", function () {
  // Declare variables to reuse across tests
  let PolkadotDAO: any;
  let dao: any;
  let owner: any, member1: any, member2: any;

  // Setup before each test
  beforeEach(async function () {
    [owner, member1, member2] = await ethers.getSigners();

    // Deploy the contract with owner as the initial member
    PolkadotDAO = await ethers.getContractFactory("PolkadotDAO");
    dao = await PolkadotDAO.deploy([owner.address]);
    await dao.waitForDeployment();
  });

  it("should initialize with correct initial members", async function () {
    expect(await dao.memberTokens(owner.address)).to.equal(100);
    expect(await dao.balanceOf(owner.address)).to.equal(parseEther("100"));
    expect(await dao.totalMembers()).to.equal(1);
  });

  it("should add a member", async function () {
    await dao.addMember(member1.address, 50); // Add member1 with 50 tokens
    expect(await dao.memberTokens(member1.address)).to.equal(50);
    expect(await dao.balanceOf(member1.address)).to.equal(parseEther("50"));
    expect(await dao.totalMembers()).to.equal(2);
  });

  it("should not allow adding an existing member", async function () {
    await dao.addMember(member1.address, 50);
    await expect(
      dao.addMember(member1.address, 25)
    ).to.be.revertedWith("Already a member!");
  });

  it("should allow proposing and store proposal details", async function () {
    await dao.propose("Build a community center");
    const proposal = await dao.proposals(0);

    expect(proposal.description).to.equal("Build a community center");
    expect(proposal.voteCount).to.equal(0);
    expect(proposal.executed).to.be.false;
    expect(proposal.proposer).to.equal(owner.address);
    expect(await dao.getProposalCount()).to.equal(1);
  });

  it("should allow voting and update vote count", async function () {
    await dao.addMember(member1.address, 50);
    await dao.propose("Fund a project");

    // Member1 votes
    await dao.connect(member1).vote(0);
    const proposal = await dao.proposals(0);

    expect(proposal.voteCount).to.equal(50); // member1 has 50 tokens
    expect(await dao.hasVoted(member1.address, 0)).to.be.true;
  });

  it("should not allow double voting", async function () {
    await dao.propose("Test proposal");
    await dao.vote(0); // Owner votes
    await expect(dao.vote(0)).to.be.revertedWith("Already voted!");
  });

  it("should not allow voting after deadline", async function () {
    await dao.propose("Time-sensitive proposal");

    // Fast-forward time past 3 days (deadline)
    await time.increase(3 * 24 * 60 * 60 + 1); // 3 days + 1 second

    await expect(dao.vote(0)).to.be.revertedWith("Voting has ended!");
  });

  /*
  it("should execute a proposal with majority votes", async function () {
    await dao.addMember(member1.address, 150); // Total tokens: 100 (owner) + 150 (member1) = 250
    await dao.propose("Executable proposal");

    // Owner and member1 vote (100 + 150 = 250 votes)
    await dao.vote(0);
    await dao.connect(member1).vote(0);

    // Fast-forward past deadline
    await time.increase(3 * 24 * 60 * 60 + 1);

    await dao.executeProposal(0);
    const proposal = await dao.proposals(0);
    expect(proposal.executed).to.be.true;
  });
  */


  it("should not execute without majority votes", async function () {
    await dao.addMember(member1.address, 50); // Total tokens: 100 (owner) + 50 (member1) = 150
    await dao.propose("Minority proposal");

    // Only owner votes (100 votes, need > 75 for majority)
    await dao.vote(0);

    await time.increase(3 * 24 * 60 * 60 + 1);
    await expect(dao.executeProposal(0)).to.be.revertedWith("Not enough votes!");
  });
});