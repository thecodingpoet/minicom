# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::UpdateTicketStatus, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation UpdateTicketStatus($input: UpdateTicketStatusInput!) {
        updateTicketStatus(input: $input) {
          ticket { id status }
          errors
        }
      }
    GQL
  end

  it "updates status when authenticated as agent" do
    ticket = create(:ticket, status: :open)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          status: "closed"
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["updateTicketStatus"]
    expect(data["ticket"]["status"]).to eq("closed")
    expect(ticket.reload.status).to eq("closed")
  end

  it "raises when unauthenticated" do
    ticket = create(:ticket)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          status: "closed"
        }
      },
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
  end

  it "raises when authenticated as customer" do
    ticket = create(:ticket)
    customer = ticket.customer

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          status: "closed"
        }
      },
      context: { current_user: customer }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Only agents can update ticket status")
  end

  it "raises for invalid status" do
    ticket = create(:ticket)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          status: "invalid_status"
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to include("Invalid status")
  end

  it "creates ticket_closed notification for customer when agent closes unassigned ticket" do
    ticket = create(:ticket, status: :open, assigned_agent_id: nil)
    agent = create(:user, :agent)

    allow(NotificationChannel).to receive(:broadcast_to)
    allow(ActionCable.server).to receive(:broadcast)
    allow(TicketChannel).to receive(:broadcast_to)

    expect {
      execute_graphql(
        query: mutation,
        variables: { input: { ticketId: ticket.id.to_s, status: "closed" } },
        context: { current_user: agent }
      )
    }.to change { Notification.count }.by(1)

    notification = Notification.last
    expect(notification.recipient).to eq(ticket.customer)
    expect(notification.actor).to eq(agent)
    expect(notification.action).to eq("ticket_closed")
  end

  it "raises when trying to reopen closed ticket" do
    ticket = create(:ticket, status: :closed)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          status: "open"
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Closed tickets cannot be reopened")
  end
end
