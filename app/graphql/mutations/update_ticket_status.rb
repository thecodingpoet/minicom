module Mutations
  class UpdateTicketStatus < BaseMutation
    argument :ticket_id, ID, required: true
    argument :status, String, required: true

    field :ticket, Types::TicketType, null: true
    field :errors, [ String ], null: false

    VALID_STATUSES = %w[open in_progress closed].freeze

    def resolve(ticket_id:, status:)
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
      raise GraphQL::ExecutionError, "Only agents can update ticket status" unless context[:current_user].agent?
      raise GraphQL::ExecutionError, "Invalid status: #{status}" unless status.in?(VALID_STATUSES)

      ticket = Ticket.find(ticket_id)
      raise GraphQL::ExecutionError, "Closed tickets cannot be reopened" if ticket.closed?

      if ticket.update(status: status)
        { ticket: ticket, errors: [] }
      else
        { ticket: nil, errors: ticket.errors.full_messages }
      end
    end
  end
end
