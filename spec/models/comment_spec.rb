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

  describe "create_notification callback" do
    before do
      allow(TicketChannel).to receive(:broadcast_to)
      allow(NotificationChannel).to receive(:broadcast_to)
    end

    it "notifies customer when agent comments" do
      ticket = create(:ticket)
      agent = create(:user, :agent)

      expect {
        create(:comment, ticket: ticket, user: agent)
      }.to change { Notification.count }.by(1)

      notification = Notification.last
      expect(notification.recipient).to eq(ticket.customer)
      expect(notification.actor).to eq(agent)
      expect(notification.action).to eq("new_comment")
      expect(notification.notifiable_type).to eq("Comment")
    end

    it "notifies assigned agent when customer comments" do
      agent = create(:user, :agent)
      ticket = create(:ticket, :with_agent_comment, assigned_agent: agent)
      customer = ticket.customer

      expect {
        create(:comment, ticket: ticket, user: customer)
      }.to change { Notification.count }.by(1)

      notification = Notification.last
      expect(notification.recipient).to eq(agent)
      expect(notification.actor).to eq(customer)
      expect(notification.action).to eq("new_comment")
    end

    it "does not create notification when customer comments on unassigned ticket" do
      ticket = create(:ticket, :with_agent_comment, assigned_agent_id: nil)
      customer = ticket.customer

      # The :with_agent_comment trait already created a notification.
      # A customer comment on an unassigned ticket should not create another.
      expect {
        create(:comment, ticket: ticket, user: customer)
      }.not_to change { customer.notifications.count }
    end
  end
end
