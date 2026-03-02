module Mutations
  class CreateTicket < BaseMutation
    ALLOWED_CONTENT_TYPES = [
      "image/jpeg", "image/pjpeg", "image/png", "image/gif", "image/webp",
      "application/pdf"
    ].freeze

    argument :subject, String, required: true
    argument :description, String, required: true
    argument :attachments, [ ApolloUploadServer::Upload ], required: false

    field :ticket, Types::TicketType, null: true
    field :errors, [ String ], null: false

    def resolve(subject:, description:, attachments: [])
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
      raise GraphQL::ExecutionError, "Only customers can create tickets" unless context[:current_user].customer?

      ticket = context[:current_user].tickets.build(subject: subject, description: description)

      if ticket.save
        (attachments || []).each do |file|
          validate_attachment!(file)
          ticket.attachments.attach(
            io: file.tempfile,
            filename: file.original_filename,
            content_type: file.content_type
          )
        end
        { ticket: ticket, errors: [] }
      else
        { ticket: nil, errors: ticket.errors.full_messages }
      end
    end

    private

    def validate_attachment!(file)
      content_type = file.content_type
      return if content_type.in?(ALLOWED_CONTENT_TYPES)

      raise GraphQL::ExecutionError,
        "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed."
    end
  end
end
