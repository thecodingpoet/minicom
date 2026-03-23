# frozen_string_literal: true

module Resolvers
  class TicketExportResolver < Resolvers::BaseResolver
    type Types::TicketExportType, null: true

    argument :id, ID, required: true

    def resolve(id:)
      require_authentication!
      current_user.ticket_exports.find_by(id: id)
    end
  end
end
