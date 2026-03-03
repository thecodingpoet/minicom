export const ROLES = {
  AGENT: "agent",
  CUSTOMER: "customer",
};

export const isAgent = (user) => user?.role === ROLES.AGENT;
export const isCustomer = (user) => user?.role === ROLES.CUSTOMER;
