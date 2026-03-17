# frozen_string_literal: true

module Resolvers
  class TicketResolver < Resolvers::BaseResolver
    type Types::TicketType, null: true

    argument :id, ID, required: true

    def resolve(id:)
      require_authentication!

      ticket = Ticket.includes(:customer, :assigned_agent, comments: :user)
                    .with_attached_attachments
                    .find(id)

      if current_user.customer? && ticket.customer_id != current_user.id
        raise GraphQL::ExecutionError, "Not authorized"
      end

      ticket
    end
  end
end
