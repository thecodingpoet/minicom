module Types
  class QueryType < Types::BaseObject
    field :current_user, Types::UserType, null: true

    def current_user
      context[:current_user]
    end

    field :tickets, [ Types::TicketType ], null: false do
      argument :status, String, required: false
      argument :assignment, String, required: false
    end

    def tickets(status: nil, assignment: nil)
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]

      scope = if context[:current_user].customer?
        context[:current_user].tickets
      else
        Ticket.all
      end

      scope = scope.where(status: status) if status.present?

      if context[:current_user].agent? && assignment.present?
        case assignment
        when "mine"
          scope = scope.where(assigned_agent_id: context[:current_user].id)
        when "unassigned"
          scope = scope.unassigned
        end
      end

      scope.includes(:customer, :assigned_agent).order(created_at: :desc)
    end

    field :ticket, Types::TicketType, null: true do
      argument :id, ID, required: true
    end

    def ticket(id:)
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]

      ticket = Ticket.includes(:customer, :assigned_agent, comments: :user).find(id)

      if context[:current_user].customer? && ticket.customer_id != context[:current_user].id
        raise GraphQL::ExecutionError, "Not authorized"
      end

      ticket
    end

    field :agents, [ Types::UserType ], null: false

    def agents
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
      raise GraphQL::ExecutionError, "Only agents can list agents" unless context[:current_user].agent?

      User.agent
    end
  end
end
