# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::ExportClosedTickets, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation ExportClosedTickets {
        exportClosedTickets(input: {}) {
          ticketExport {
            id
            status
            downloadUrl
            errorMessage
          }
          errors
        }
      }
    GQL
  end

  it "creates an export with download URL when authenticated as agent" do
    agent = create(:user, :agent)
    ticket = create(:ticket, :closed, customer: create(:user))

    result = execute_graphql(
      query: mutation,
      variables: {},
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["exportClosedTickets"]
    expect(data["errors"]).to eq([])

    export_payload = data["ticketExport"]
    expect(export_payload["status"]).to eq("ready")
    expect(export_payload["downloadUrl"]).to be_present
    expect(export_payload["errorMessage"]).to be_nil

    export = TicketExport.find(export_payload["id"])
    expect(export.user_id).to eq(agent.id)
    expect(export).to be_ready
    expect(export.file).to be_attached

    csv = CSV.parse(export.file.download, headers: true)
    expect(csv.headers).to include("Ticket ID", "Subject", "Customer Email")
    expect(csv.map { |row| row["Ticket ID"].to_i }).to include(ticket.id)
  end

  it "raises when unauthenticated" do
    result = execute_graphql(
      query: mutation,
      variables: {},
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
  end

  it "raises when authenticated as customer" do
    customer = create(:user)

    result = execute_graphql(
      query: mutation,
      variables: {},
      context: { current_user: customer }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Only agents can export tickets")
  end

  it "only includes tickets closed within last 30 days" do
    agent = create(:user, :agent)
    recent_ticket = create(:ticket, :closed, customer: create(:user))
    old_ticket = create(:ticket, :closed, customer: create(:user))
    old_ticket.update_columns(updated_at: 31.days.ago)

    result = execute_graphql(
      query: mutation,
      variables: {},
      context: { current_user: agent }
    )

    data = result["data"]["exportClosedTickets"]
    export = TicketExport.find(data["ticketExport"]["id"])
    csv = CSV.parse(export.file.download, headers: true)
    ticket_ids = csv.map { |row| row["Ticket ID"].to_i }

    expect(ticket_ids).to include(recent_ticket.id)
    expect(ticket_ids).not_to include(old_ticket.id)
  end
end
