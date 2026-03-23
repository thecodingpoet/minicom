# frozen_string_literal: true

module Mutations
  class MarkNotificationAsRead < BaseMutation
    argument :notification_id, ID, required: true

    field :notification, Types::NotificationType, null: true
    field :errors, [ String ], null: false

    def resolve(notification_id:)
      require_authentication!

      notification = current_user.notifications.find(notification_id)
      notification.mark_as_read!

      { notification: notification, errors: [] }
    end
  end
end
