module Mutations
  class UpdateTicketStatus < BaseMutation
    argument :ticket_id, ID, required: true
    argument :status, String, required: true

    field :ticket, Types::TicketType, null: true
    field :errors, [ String ], null: false

    VALID_STATUSES = %w[open in_progress closed].freeze

    def resolve(ticket_id:, status:)
      raise GraphQL::ExecutionError, "Invalid status: #{status}" unless status.in?(VALID_STATUSES)

      ticket = Ticket.find(ticket_id)
      authorize!(ticket, :update_status?, message: "Only agents can update ticket status")
      raise GraphQL::ExecutionError, "Closed tickets cannot be reopened" if ticket.closed?

      updates = { status: status }
      if status == "closed" && ticket.assigned_agent_id.nil?
        updates[:assigned_agent_id] = current_user.id
      end

      if ticket.update(updates)
        { ticket: ticket, errors: [] }
      else
        { ticket: nil, errors: ticket.errors.full_messages }
      end
    end
  end
end
