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

      authorize!(ticket, :show?, message: "Not authorized", require_login: false)

      ticket
    end
  end
end
