# frozen_string_literal: true

module Mutations
  class ExportClosedTickets < BaseMutation
    field :ticket_export, Types::TicketExportType, null: true
    field :errors, [ String ], null: false

    def resolve
      authorize!(TicketExport, :create?, message: "Only agents can export tickets")

      export = TicketExport.create!(user: current_user, status: :pending)
      ExportClosedTicketsJob.perform_later(export.id)

      { ticket_export: export.reload, errors: [] }
    end
  end
end
