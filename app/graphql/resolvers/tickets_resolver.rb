# frozen_string_literal: true

module Resolvers
  class TicketsResolver < Resolvers::BaseResolver
    include Resolvers::Concerns::TicketAssignmentScope

    type [ Types::TicketType ], null: false

    argument :status, String, required: false
    argument :assignment, String, required: false

    def resolve(status: nil, assignment: nil)
      require_authentication!

      scope = current_user.customer? ? current_user.tickets : Ticket.all
      scope = scope.where(status: status) if status.present?
      scope = apply_assignment_scope(scope, assignment)

      scope.includes(:customer, :assigned_agent)
           .order(Arel.sql("CASE WHEN status = 2 THEN 1 ELSE 0 END"), created_at: :desc)
    end
  end
end
