# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::ExportClosedTickets, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation ExportClosedTickets {
        exportClosedTickets(input: {}) {
          csvData
          errors
        }
      }
    GQL
  end

  it "returns CSV data when authenticated as agent" do
    agent = create(:user, :agent)
    ticket = create(:ticket, :closed, customer: create(:user))

    result = execute_graphql(
      query: mutation,
      variables: {},
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["exportClosedTickets"]
    expect(data["csvData"]).to be_present
    expect(data["csvData"]).to include("Ticket ID")
    expect(data["csvData"]).to include("Subject")
    expect(data["csvData"]).to include("Customer Email")
    expect(data["csvData"]).to include(ticket.subject)
    expect(data["errors"]).to eq([])
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
    csv = CSV.parse(data["csvData"], headers: true)
    ticket_ids = csv.map { |row| row["Ticket ID"].to_i }

    expect(ticket_ids).to include(recent_ticket.id)
    expect(ticket_ids).not_to include(old_ticket.id)
  end
end
