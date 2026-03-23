# frozen_string_literal: true

module Resolvers
  class BaseResolver < GraphQL::Schema::Resolver
    include PunditHelpers
    include GraphqlAuthentication
  end
end
