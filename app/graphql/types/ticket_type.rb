module Types
  class TicketType < Types::BaseObject
    field :id, ID, null: false
    field :subject, String, null: false
    field :description, String, null: false
    field :status, String, null: false
    field :customer, Types::UserType, null: false
    field :assigned_agent, Types::UserType, null: true
    field :comments, [Types::CommentType], null: false
    field :attachments, [Types::AttachmentType], null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
