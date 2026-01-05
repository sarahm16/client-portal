const mappedStatuses = {
  New: "New",
  Sourcing: "Accepted",
  Sourced: "Accepted",
  Scheduled: "Scheduled",
  "In Progress": "In Progress",
  Completed: "Completed",
  Reopened: "Reopened",
  Cancelled: "Cancelled",
  "Requires proposal": "Requires proposal",
  "Waiting approval": "Waiting approval",
  "Proposal Approved": "Proposal Approved",
};

const mapStatus = (status) => {
  return mappedStatuses[status] || "Pending";
};

export default mapStatus;
