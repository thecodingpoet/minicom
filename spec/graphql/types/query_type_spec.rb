# frozen_string_literal: true

require "rails_helper"

RSpec.describe Types::QueryType, type: :graphql do
  describe "currentUser" do
    let(:query) do
      <<~GQL
        query {
          currentUser {
            id
            email
          }
        }
      GQL
    end

    it "returns user when authenticated" do
      user = create(:user)

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: user }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["currentUser"]["email"]).to eq(user.email)
    end

    it "returns null when not authenticated" do
      result = execute_graphql(
        query: query,
        variables: {},
        context: {}
      )

      expect(result["data"]["currentUser"]).to be_nil
    end
  end

  describe "ticketCounts" do
    let(:query) do
      <<~GQL
        query TicketCounts($assignment: String) {
          ticketCounts(assignment: $assignment) {
            open
            inProgress
            closed
            all
          }
        }
      GQL
    end

    it "returns zero counts for customer" do
      customer = create(:user)
      create(:ticket, customer: customer)

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: customer }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["ticketCounts"]).to eq(
        "open" => 0, "inProgress" => 0, "closed" => 0, "all" => 0
      )
    end

    it "returns correct counts for agent" do
      agent = create(:user, :agent)
      create(:ticket, status: :open)
      create(:ticket, status: :open)
      create(:ticket, status: :in_progress)
      create(:ticket, status: :closed)

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["ticketCounts"]["open"]).to eq(2)
      expect(result["data"]["ticketCounts"]["inProgress"]).to eq(1)
      expect(result["data"]["ticketCounts"]["closed"]).to eq(1)
      expect(result["data"]["ticketCounts"]["all"]).to eq(4)
    end

    it "respects assignment filter" do
      agent = create(:user, :agent)
      my_ticket = create(:ticket, status: :open, assigned_agent: agent)
      create(:ticket, status: :open, assigned_agent_id: nil)

      result = execute_graphql(
        query: query,
        variables: { assignment: "mine" },
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["ticketCounts"]["all"]).to eq(1)
    end
  end

  describe "tickets" do
    let(:query) do
      <<~GQL
        query Tickets($status: String, $assignment: String) {
          tickets(status: $status, assignment: $assignment) {
            id
            subject
          }
        }
      GQL
    end

    it "raises when unauthenticated" do
      result = execute_graphql(
        query: query,
        variables: {},
        context: {}
      )

      expect(result["errors"]).to be_present
      expect(result["errors"].first["message"]).to eq("Authentication required")
    end

    it "returns only customer's tickets when customer" do
      customer = create(:user)
      own_ticket = create(:ticket, customer: customer)
      other_ticket = create(:ticket, customer: create(:user))

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: customer }
      )

      expect(result["errors"]).to be_nil
      ticket_ids = result["data"]["tickets"].map { |t| t["id"] }
      expect(ticket_ids).to include(own_ticket.id.to_s)
      expect(ticket_ids).not_to include(other_ticket.id.to_s)
    end

    it "returns all tickets when agent" do
      agent = create(:user, :agent)
      ticket1 = create(:ticket)
      ticket2 = create(:ticket)

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["tickets"].size).to eq(2)
    end

    it "filters by status when agent" do
      agent = create(:user, :agent)
      open_ticket = create(:ticket, status: :open)
      closed_ticket = create(:ticket, status: :closed)

      result = execute_graphql(
        query: query,
        variables: { status: "closed" },
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["tickets"].size).to eq(1)
      expect(result["data"]["tickets"].first["id"]).to eq(closed_ticket.id.to_s)
    end

    it "filters by assignment when agent" do
      agent = create(:user, :agent)
      assigned_ticket = create(:ticket, :assigned)
      unassigned_ticket = create(:ticket, assigned_agent_id: nil)

      result = execute_graphql(
        query: query,
        variables: { assignment: "unassigned" },
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      ticket_ids = result["data"]["tickets"].map { |t| t["id"] }
      expect(ticket_ids).to include(unassigned_ticket.id.to_s)
      expect(ticket_ids).not_to include(assigned_ticket.id.to_s)
    end
  end

  describe "ticket" do
    let(:query) do
      <<~GQL
        query Ticket($id: ID!) {
          ticket(id: $id) {
            id
            subject
          }
        }
      GQL
    end

    it "returns ticket when customer owns it" do
      ticket = create(:ticket)
      customer = ticket.customer

      result = execute_graphql(
        query: query,
        variables: { id: ticket.id.to_s },
        context: { current_user: customer }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["ticket"]["subject"]).to eq(ticket.subject)
    end

    it "returns ticket when agent" do
      ticket = create(:ticket)
      agent = create(:user, :agent)

      result = execute_graphql(
        query: query,
        variables: { id: ticket.id.to_s },
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["ticket"]["subject"]).to eq(ticket.subject)
    end

    it "raises when customer requests another customer's ticket" do
      ticket = create(:ticket)
      other_customer = create(:user)

      result = execute_graphql(
        query: query,
        variables: { id: ticket.id.to_s },
        context: { current_user: other_customer }
      )

      expect(result["errors"]).to be_present
      expect(result["errors"].first["message"]).to eq("Not authorized")
    end
  end

  describe "agents" do
    let(:query) do
      <<~GQL
        query {
          agents {
            id
            email
          }
        }
      GQL
    end

    it "returns agents when authenticated as agent" do
      agent = create(:user, :agent)
      other_agent = create(:user, :agent)

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: agent }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["agents"].size).to eq(2)
    end

    it "raises when authenticated as customer" do
      customer = create(:user)

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: customer }
      )

      expect(result["errors"]).to be_present
      expect(result["errors"].first["message"]).to eq("Only agents can list agents")
    end
  end
end
