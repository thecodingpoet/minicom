# frozen_string_literal: true

module Types
  class NotificationType < Types::BaseObject
    field :id, ID, null: false
    field :action, String, null: false
    field :actor, Types::UserType, null: false
    field :ticket_id, ID, null: true
    field :ticket_subject, String, null: true
    field :read_at, GraphQL::Types::ISO8601DateTime, null: true
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false

    def ticket_id
      object.ticket&.id
    end

    def ticket_subject
      object.ticket&.subject
    end
  end
end
