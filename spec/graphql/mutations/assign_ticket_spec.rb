# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::AssignTicket, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation AssignTicket($input: AssignTicketInput!) {
        assignTicket(input: $input) {
          ticket { id assignedAgent { id } }
          errors
        }
      }
    GQL
  end

  it "assigns agent to ticket when authenticated as agent" do
    ticket = create(:ticket)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          agentId: agent.id.to_s
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["assignTicket"]
    expect(data["ticket"]["assignedAgent"]["id"]).to be_present
    expect(ticket.reload.assigned_agent_id).to eq(agent.id)
  end

  it "unassigns agent when agentId is null" do
    ticket = create(:ticket, :assigned)
    agent = ticket.assigned_agent
    other_agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          agentId: nil
        }
      },
      context: { current_user: other_agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["assignTicket"]
    expect(data["ticket"]["assignedAgent"]).to be_nil
    expect(ticket.reload.assigned_agent_id).to be_nil
  end

  it "raises when unauthenticated" do
    ticket = create(:ticket)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          agentId: agent.id.to_s
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
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          agentId: agent.id.to_s
        }
      },
      context: { current_user: customer }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Only agents can assign tickets")
  end

  it "raises when target user is not an agent" do
    ticket = create(:ticket)
    agent = create(:user, :agent)
    customer = create(:user)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          agentId: customer.id.to_s
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Target user is not an agent")
  end
end
