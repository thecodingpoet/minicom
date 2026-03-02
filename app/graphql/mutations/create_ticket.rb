module Mutations
  class CreateTicket < BaseMutation
    argument :subject, String, required: true
    argument :description, String, required: true
    argument :attachments, [ApolloUploadServer::Upload], required: false

    field :ticket, Types::TicketType, null: true
    field :errors, [String], null: false

    def resolve(subject:, description:, attachments: [])
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
      raise GraphQL::ExecutionError, "Only customers can create tickets" unless context[:current_user].customer?

      ticket = context[:current_user].tickets.build(subject: subject, description: description)

      if ticket.save
        attachments&.each { |file| ticket.attachments.attach(file) }
        { ticket: ticket, errors: [] }
      else
        { ticket: nil, errors: ticket.errors.full_messages }
      end
    end
  end
end
