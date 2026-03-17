# frozen_string_literal: true

module Resolvers
  class BaseResolver < GraphQL::Schema::Resolver
    def require_authentication!
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
    end

    def require_agent!(message: "Only agents can perform this action")
      require_authentication!
      raise GraphQL::ExecutionError, message unless context[:current_user].agent?
    end

    def current_user
      context[:current_user]
    end
  end
end
