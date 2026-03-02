module Mutations
  class AssignTicket < BaseMutation
    argument :ticket_id, ID, required: true
    argument :agent_id, ID, required: false

    field :ticket, Types::TicketType, null: true
    field :errors, [String], null: false

    def resolve(ticket_id:, agent_id: nil)
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
      raise GraphQL::ExecutionError, "Only agents can assign tickets" unless context[:current_user].agent?

      ticket = Ticket.find(ticket_id)

      if agent_id.present?
        agent = User.find(agent_id)
        raise GraphQL::ExecutionError, "Target user is not an agent" unless agent.agent?
        ticket.assigned_agent = agent
      else
        ticket.assigned_agent = nil
      end

      if ticket.save
        { ticket: ticket, errors: [] }
      else
        { ticket: nil, errors: ticket.errors.full_messages }
      end
    end
  end
end
