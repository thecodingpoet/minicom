# frozen_string_literal: true

require "csv"

class ExportClosedTicketsJob < ApplicationJob
  queue_as :default

  HEADERS = [ "Ticket ID", "Subject", "Customer Email", "Status", "Created At", "Closed At" ].freeze

  def perform(ticket_export_id)
    export = TicketExport.find_by(id: ticket_export_id)
    return if export.blank?
    return unless export.pending?

    export.file.purge if export.file.attached?

    Tempfile.create([ "closed-tickets", ".csv" ]) do |temp|
      CSV.open(temp.path, "wb", write_headers: true, headers: HEADERS) do |csv|
        tickets_scope.find_each do |ticket|
          csv << [
            ticket.id,
            ticket.subject,
            ticket.customer.email,
            ticket.status,
            ticket.created_at.iso8601,
            ticket.updated_at.iso8601
          ]
        end
      end

      export.file.attach(
        io: File.open(temp.path, "rb"),
        filename: "closed-tickets-#{Time.zone.today.iso8601}.csv",
        content_type: "text/csv"
      )
    end

    export.update!(status: :ready, error_message: nil)
  rescue StandardError => e
    Rails.logger.error("ExportClosedTicketsJob failed: #{e.class}: #{e.message}")
    export&.update(status: :failed, error_message: e.message.to_s.truncate(500))
  end

  private

  def tickets_scope
    Ticket.closed.where(updated_at: 30.days.ago..Time.current).includes(:customer)
  end
end
