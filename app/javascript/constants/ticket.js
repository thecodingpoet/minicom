export const TICKET_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  CLOSED: "closed",
};

export const isClosed = (status) => status === TICKET_STATUS.CLOSED;
