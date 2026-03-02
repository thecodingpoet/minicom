require "csv"

module Mutations
  class ExportClosedTickets < BaseMutation
    field :csv_data, String, null: true
    field :errors, [String], null: false

    def resolve
      raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
      raise GraphQL::ExecutionError, "Only agents can export tickets" unless context[:current_user].agent?

      tickets = Ticket.closed.where(updated_at: 30.days.ago..Time.current).includes(:customer)

      csv_string = CSV.generate(headers: true) do |csv|
        csv << ["Ticket ID", "Subject", "Customer Email", "Status", "Created At", "Closed At"]
        tickets.find_each do |ticket|
          csv << [ticket.id, ticket.subject, ticket.customer.email, ticket.status, ticket.created_at, ticket.updated_at]
        end
      end

      { csv_data: csv_string, errors: [] }
    end
  end
end
