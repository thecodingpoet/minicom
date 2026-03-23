# frozen_string_literal: true

module Mutations
  class ExportClosedTickets < BaseMutation
    field :ticket_export, Types::TicketExportType, null: true
    field :errors, [ String ], null: false

    def resolve
      user = context[:current_user]
      raise GraphQL::ExecutionError, "Authentication required" unless user
      raise GraphQL::ExecutionError, "Only agents can export tickets" unless user.agent?

      export = TicketExport.create!(user: user, status: :pending)
      ExportClosedTicketsJob.perform_later(export.id)

      { ticket_export: export.reload, errors: [] }
    end
  end
end
