# frozen_string_literal: true

module Resolvers
  class CurrentUserResolver < Resolvers::BaseResolver
    type Types::UserType, null: true

    def resolve
      current_user
    end
  end
end
