module Mutations
  class CreateComment < BaseMutation
    argument :ticket_id, ID, required: true
    argument :body, String, required: true

    field :comment, Types::CommentType, null: true
    field :errors, [ String ], null: false

    def resolve(ticket_id:, body:)
      require_authentication!
      ticket = Ticket.find(ticket_id)
      authorize!(ticket, :comment?, message: "Not authorized to comment on this ticket", require_login: false)

      comment = ticket.comments.build(body: body, user: current_user)

      if comment.save
        { comment: comment, errors: [] }
      else
        { comment: nil, errors: comment.errors.full_messages }
      end
    end
  end
end
