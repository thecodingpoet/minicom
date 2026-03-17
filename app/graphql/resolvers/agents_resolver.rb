# frozen_string_literal: true

module Resolvers
  class AgentsResolver < Resolvers::BaseResolver
    type [ Types::UserType ], null: false

    def resolve
      require_agent!(message: "Only agents can list agents")
      User.agent
    end
  end
end
