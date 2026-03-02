import { gql } from "@apollo/client/core";

export const SIGN_UP = gql`
  mutation SignUp(
    $email: String!
    $password: String!
    $passwordConfirmation: String!
    $firstName: String!
    $lastName: String!
  ) {
    signUp(
      input: {
        email: $email
        password: $password
        passwordConfirmation: $passwordConfirmation
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      token
      user {
        id
        email
        firstName
        lastName
        fullName
        role
      }
      errors
    }
  }
`;

export const SIGN_IN = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
        firstName
        lastName
        fullName
        role
      }
      errors
    }
  }
`;

export const CREATE_TICKET = gql`
  mutation CreateTicket($subject: String!, $description: String!, $attachments: [Upload!]) {
    createTicket(input: { subject: $subject, description: $description, attachments: $attachments }) {
      ticket {
        id
        subject
        status
      }
      errors
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($ticketId: ID!, $body: String!) {
    createComment(input: { ticketId: $ticketId, body: $body }) {
      comment {
        id
        body
        createdAt
        user {
          id
          fullName
          role
        }
      }
      errors
    }
  }
`;

export const UPDATE_TICKET_STATUS = gql`
  mutation UpdateTicketStatus($ticketId: ID!, $status: String!) {
    updateTicketStatus(input: { ticketId: $ticketId, status: $status }) {
      ticket {
        id
        status
      }
      errors
    }
  }
`;

export const ASSIGN_TICKET = gql`
  mutation AssignTicket($ticketId: ID!, $agentId: ID) {
    assignTicket(input: { ticketId: $ticketId, agentId: $agentId }) {
      ticket {
        id
        assignedAgent {
          id
          fullName
        }
      }
      errors
    }
  }
`;

export const EXPORT_CLOSED_TICKETS = gql`
  mutation ExportClosedTickets {
    exportClosedTickets(input: {}) {
      csvData
      errors
    }
  }
`;

export const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($notificationId: ID!) {
    markNotificationAsRead(input: { notificationId: $notificationId }) {
      notification {
        id
        readAt
      }
      errors
    }
  }
`;

export const MARK_ALL_NOTIFICATIONS_AS_READ = gql`
  mutation MarkAllNotificationsAsRead {
    markAllNotificationsAsRead(input: {}) {
      updatedCount
      errors
    }
  }
`;
