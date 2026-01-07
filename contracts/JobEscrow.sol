// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title JobEscrow
 * @dev Handles secure payments between Job Owners and Agents for the Agent Guild platform.
 */
contract JobEscrow {
  enum JobStatus {
    Open,
    Matched,
    InProgress,
    Submitted,
    Completed,
    Cancelled,
    Disputed
  }

  struct Job {
    uint256 id;
    address payable owner;
    address payable agent;
    uint256 budget;
    JobStatus status;
    bool exists;
  }

  uint256 public nextJobId = 1;
  mapping(uint256 => Job) public jobs;

  event JobCreated(uint256 indexed jobId, address indexed owner, uint256 budget);
  event AgentAssigned(uint256 indexed jobId, address indexed agent);
  event JobCompleted(uint256 indexed jobId, uint256 amount);
  event JobCancelled(uint256 indexed jobId);
  event Refunded(uint256 indexed jobId, address indexed owner, uint256 amount);

  modifier onlyJobOwner(uint256 _jobId) {
    require(jobs[_jobId].owner == msg.sender, 'Not the job owner');
    _;
  }

  modifier onlyMatchedAgent(uint256 _jobId) {
    require(jobs[_jobId].agent == msg.sender, 'Not the assigned agent');
    _;
  }

  /**
   * @dev Create a new job and deposit funds.
   */
  function createJob() external payable returns (uint256) {
    require(msg.value > 0, 'Budget must be greater than zero');

    uint256 jobId = nextJobId++;
    jobs[jobId] = Job({
      id: jobId,
      owner: payable(msg.sender),
      agent: payable(address(0)),
      budget: msg.value,
      status: JobStatus.Open,
      exists: true
    });

    emit JobCreated(jobId, msg.sender, msg.value);
    return jobId;
  }

  /**
   * @dev Assign an agent to a job.
   * @param _jobId The ID of the job.
   * @param _agent The address of the agent.
   */
  function assignAgent(uint256 _jobId, address payable _agent) external onlyJobOwner(_jobId) {
    require(jobs[_jobId].status == JobStatus.Open, 'Job already matched or closed');
    require(_agent != address(0), 'Invalid agent address');

    jobs[_jobId].agent = _agent;
    jobs[_jobId].status = JobStatus.Matched;

    emit AgentAssigned(_jobId, _agent);
  }

  /**
   * @dev Release funds to the agent (Owner confirms work).
   */
  function completeJob(uint256 _jobId) external onlyJobOwner(_jobId) {
    require(jobs[_jobId].status != JobStatus.Completed, 'Job already completed');
    require(jobs[_jobId].agent != address(0), 'No agent assigned');

    uint256 amount = jobs[_jobId].budget;
    jobs[_jobId].status = JobStatus.Completed;

    (bool success, ) = jobs[_jobId].agent.call{ value: amount }('');
    require(success, 'Transfer failed');

    emit JobCompleted(_jobId, amount);
  }

  /**
   * @dev Cancel job and refund owner (Only if no agent assigned).
   */
  function cancelJob(uint256 _jobId) external onlyJobOwner(_jobId) {
    require(jobs[_jobId].status == JobStatus.Open, 'Cannot cancel after agent assigned');

    uint256 amount = jobs[_jobId].budget;
    jobs[_jobId].status = JobStatus.Cancelled;

    (bool success, ) = jobs[_jobId].owner.call{ value: amount }('');
    require(success, 'Refund failed');

    emit JobCancelled(_jobId);
  }

  /**
   * @dev Get job details.
   */
  function getJob(uint256 _jobId) external view returns (Job memory) {
    require(jobs[_jobId].exists, 'Job does not exist');
    return jobs[_jobId];
  }
}
