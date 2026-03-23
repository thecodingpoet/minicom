# frozen_string_literal: true

module Resolvers
  class TicketCountsResolver < Resolvers::BaseResolver
    include Resolvers::Concerns::TicketAssignmentScope

    type Types::TicketCountsType, null: false

    argument :assignment, String, required: false

    def resolve(assignment: nil)
      return { open: 0, in_progress: 0, closed: 0, all: 0 } if current_user.customer?

      scope = Ticket.all
      scope = apply_assignment_scope(scope, assignment)

      counts = scope.group(:status).count
      {
        open: counts["open"] || 0,
        in_progress: counts["in_progress"] || 0,
        closed: counts["closed"] || 0,
        all: counts.values.sum
      }
    end
  end
end
