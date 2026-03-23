# frozen_string_literal: true

module Mutations
  class MarkAllNotificationsAsRead < BaseMutation
    field :updated_count, Integer, null: false
    field :errors, [ String ], null: false

    def resolve
      require_authentication!

      count = current_user.notifications.unread.update_all(read_at: Time.current)

      { updated_count: count, errors: [] }
    end
  end
end
