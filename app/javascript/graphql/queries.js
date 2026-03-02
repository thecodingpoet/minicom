import { gql } from "@apollo/client/core";

export const GET_TICKETS = gql`
  query GetTickets($status: String, $assignment: String) {
    tickets(status: $status, assignment: $assignment) {
      id
      subject
      description
      status
      createdAt
      customer {
        id
        fullName
        email
      }
      assignedAgent {
        id
        fullName
      }
    }
  }
`;

export const GET_TICKET = gql`
  query GetTicket($id: ID!) {
    ticket(id: $id) {
      id
      subject
      description
      status
      createdAt
      updatedAt
      customer {
        id
        fullName
        email
      }
      assignedAgent {
        id
        fullName
      }
      comments {
        id
        body
        createdAt
        user {
          id
          fullName
          role
        }
      }
      attachments {
        url
        filename
        contentType
      }
    }
  }
`;

export const GET_AGENTS = gql`
  query GetAgents {
    agents {
      id
      fullName
      email
    }
  }
`;
