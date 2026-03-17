# frozen_string_literal: true

module Resolvers
  class NotificationsResolver < Resolvers::BaseResolver
    type [ Types::NotificationType ], null: false

    argument :unread_only, Boolean, required: false

    def resolve(unread_only: false)
      require_authentication!

      scope = current_user.notifications.recent
      scope = scope.unread if unread_only
      scope.includes(:actor, notifiable: { Comment: :ticket })
    end
  end
end
