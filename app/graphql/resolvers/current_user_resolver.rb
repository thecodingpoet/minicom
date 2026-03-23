# frozen_string_literal: true

module Resolvers
  class CurrentUserResolver < Resolvers::BaseResolver
    skip_authentication!

    type Types::UserType, null: true

    def resolve
      current_user
    end
  end
end
