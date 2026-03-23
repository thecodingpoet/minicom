# frozen_string_literal: true

module Resolvers
  class AgentsResolver < Resolvers::BaseResolver
    type [ Types::UserType ], null: false

    def resolve
      authorize!(current_user, :agent_access?, message: "Only agents can list agents")
      User.agent
    end
  end
end
