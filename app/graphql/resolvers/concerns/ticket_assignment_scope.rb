# frozen_string_literal: true

module Resolvers
  module Concerns
    module TicketAssignmentScope
      def apply_assignment_scope(scope, assignment)
        return scope unless current_user&.agent? && assignment.present?

        case assignment
        when "mine"
          scope.where(assigned_agent_id: current_user.id)
        when "unassigned"
          scope.unassigned
        else
          scope
        end
      end
    end
  end
end
