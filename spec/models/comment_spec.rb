# frozen_string_literal: true

require "rails_helper"

RSpec.describe Comment, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:body) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:ticket) }
    it { is_expected.to belong_to(:user) }
  end

  describe "customer_can_comment validation" do
    before do
      allow(TicketChannel).to receive(:broadcast_to)
    end

    it "allows customer to comment when ticket has agent comment" do
      ticket = create(:ticket, :with_agent_comment)
      customer = ticket.customer
      comment = build(:comment, ticket: ticket, user: customer)
      expect(comment).to be_valid
    end

    it "prevents customer from commenting when ticket has no agent comment" do
      ticket = create(:ticket)
      customer = ticket.customer
      comment = build(:comment, ticket: ticket, user: customer)
      expect(comment).not_to be_valid
      expect(comment.errors[:base]).to include("Customers cannot comment until an agent has responded")
    end

    it "allows agent to comment regardless of agent comment presence" do
      ticket = create(:ticket)
      agent = create(:user, :agent)
      comment = build(:comment, ticket: ticket, user: agent)
      expect(comment).to be_valid
    end
  end

  describe "claim_ticket_if_agent callback" do
    before do
      allow(TicketChannel).to receive(:broadcast_to)
    end

    it "calls claim! on ticket when agent creates comment" do
      ticket = create(:ticket, status: :open, assigned_agent_id: nil)
      agent = create(:user, :agent)
      expect(ticket).to receive(:claim!).with(agent)
      create(:comment, ticket: ticket, user: agent)
    end

    it "does not call claim! when customer creates comment" do
      ticket = create(:ticket, :with_agent_comment)
      customer = ticket.customer
      expect(ticket).not_to receive(:claim!)
      create(:comment, ticket: ticket, user: customer)
    end
  end

  describe "broadcast callback" do
    it "broadcasts to ticket channel on create" do
      ticket = create(:ticket, :with_agent_comment)
      customer = ticket.customer
      expect(TicketChannel).to receive(:broadcast_to).with(ticket, { type: "update" })
      create(:comment, ticket: ticket, user: customer)
    end
  end
end