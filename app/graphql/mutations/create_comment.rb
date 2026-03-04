module Mutations
  class CreateComment < BaseMutation
    argument :ticket_id, ID, required: true
    argument :body, String, required: true

    field :comment, Types::CommentType, null: true
    field :errors, [ String ], null: false

    def resolve(ticket_id:, body:)
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]

      ticket = Ticket.find(ticket_id)

      if context[:current_user].customer?
        raise GraphQL::ExecutionError, "Not authorized to comment on this ticket" unless ticket.customer_id == context[:current_user].id
      end

      comment = ticket.comments.build(body: body, user: context[:current_user])

      if comment.save
        { comment: comment, errors: [] }
      else
        { comment: nil, errors: comment.errors.full_messages }
      end
    end
  end
end
