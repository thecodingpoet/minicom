# frozen_string_literal: true

module Resolvers
  class UnreadNotificationsCountResolver < Resolvers::BaseResolver
    type Integer, null: false

    def resolve
      require_authentication!
      current_user.notifications.unread.count
    end
  end
end
