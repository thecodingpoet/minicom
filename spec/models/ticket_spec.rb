# frozen_string_literal: true

require "rails_helper"

RSpec.describe Ticket, type: :model do
  describe "validations" do
    it { is_expected.to validate_presence_of(:subject) }
    it { is_expected.to validate_presence_of(:description) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:customer).class_name("User") }
    it { is_expected.to belong_to(:assigned_agent).class_name("User").optional }
    it { is_expected.to have_many(:comments).dependent(:destroy) }
    it { is_expected.to have_many_attached(:attachments) }
  end

  describe "scopes" do
    let!(:assigned_ticket) { create(:ticket, :assigned) }
    let!(:unassigned_ticket) { create(:ticket, assigned_agent_id: nil) }

    describe ".assigned" do
      it "returns tickets with an assigned agent" do
        expect(described_class.assigned).to include(assigned_ticket)
        expect(described_class.assigned).not_to include(unassigned_ticket)
      end
    end

    describe ".unassigned" do
      it "returns tickets without an assigned agent" do
        expect(described_class.unassigned).to include(unassigned_ticket)
        expect(described_class.unassigned).not_to include(assigned_ticket)
      end
    end
  end

  describe "#has_agent_comment?" do
    it "returns true when ticket has an agent comment" do
      ticket = create(:ticket)
      agent = create(:user, :agent)
      create(:comment, ticket: ticket, user: agent)
      expect(ticket.has_agent_comment?).to be true
    end

    it "returns false when ticket has no agent comments" do
      ticket = create(:ticket)
      expect(ticket.has_agent_comment?).to be false
    end

    it "returns false when ticket has only customer comments" do
      ticket = create(:ticket)
      # Bypass validation to simulate customer comment (normally blocked until agent responds)
      Comment.new(ticket: ticket, user: ticket.customer, body: "Customer message").save(validate: false)
      expect(ticket.reload.has_agent_comment?).to be false
    end
  end

  describe "#claim!" do
    let(:ticket) { create(:ticket, status: :open, assigned_agent_id: nil) }
    let(:agent) { create(:user, :agent) }

    before do
      allow(ActionCable.server).to receive(:broadcast)
      allow(TicketChannel).to receive(:broadcast_to)
    end

    it "assigns the agent and sets status to in_progress" do
      ticket.claim!(agent)
      expect(ticket.reload.assigned_agent_id).to eq(agent.id)
      expect(ticket.status).to eq("in_progress")
    end

    context "when ticket is already in progress" do
      let(:ticket) { create(:ticket, status: :in_progress, assigned_agent_id: nil) }

      it "assigns the agent but does not change status" do
        ticket.claim!(agent)
        expect(ticket.reload.assigned_agent_id).to eq(agent.id)
        expect(ticket.status).to eq("in_progress")
      end
    end

    context "when ticket is already assigned" do
      let(:other_agent) { create(:user, :agent) }
      let(:ticket) { create(:ticket, status: :open, assigned_agent: other_agent) }

      it "updates status to in_progress but does not change agent" do
        ticket.claim!(agent)
        expect(ticket.reload.assigned_agent_id).to eq(other_agent.id)
        expect(ticket.status).to eq("in_progress")
      end
    end

    context "when ticket is already assigned and in progress" do
      let(:ticket) { create(:ticket, :assigned, status: :in_progress) }

      it "does nothing" do
        expect { ticket.claim!(agent) }.not_to change { ticket.reload.attributes }
      end
    end
  end

  describe "callbacks" do
    before do
      allow(ActionCable.server).to receive(:broadcast)
      allow(TicketChannel).to receive(:broadcast_to)
    end

    it "broadcasts to inbox on create" do
      customer = create(:user)
      expect(ActionCable.server).to receive(:broadcast).with("inbox", { type: "new_ticket" })
      create(:ticket, customer: customer)
    end

    it "broadcasts to ticket channel on status update" do
      ticket = create(:ticket)
      expect(TicketChannel).to receive(:broadcast_to).with(ticket, { type: "update" })
      ticket.update!(status: :in_progress)
    end

    it "broadcasts to ticket channel on assigned_agent update" do
      ticket = create(:ticket)
      agent = create(:user, :agent)
      expect(TicketChannel).to receive(:broadcast_to).with(ticket, { type: "update" })
      ticket.update!(assigned_agent: agent)
    end

    it "does not broadcast on unrelated updates" do
      ticket = create(:ticket)
      expect(TicketChannel).not_to receive(:broadcast_to)
      ticket.update!(subject: "Updated subject")
    end
  end

  describe "notify_customer_on_close" do
    before do
      allow(ActionCable.server).to receive(:broadcast)
      allow(TicketChannel).to receive(:broadcast_to)
      allow(NotificationChannel).to receive(:broadcast_to)
    end

    it "creates notification for customer when ticket is closed with assigned agent" do
      agent = create(:user, :agent)
      ticket = create(:ticket, :assigned, assigned_agent: agent)

      expect {
        ticket.update!(status: :closed)
      }.to change { Notification.count }.by(1)

      notification = Notification.last
      expect(notification.recipient).to eq(ticket.customer)
      expect(notification.actor).to eq(agent)
      expect(notification.action).to eq("ticket_closed")
      expect(notification.notifiable).to eq(ticket)
    end

    it "does not create notification when ticket is closed without assigned agent" do
      ticket = create(:ticket, assigned_agent_id: nil)

      expect {
        ticket.update!(status: :closed)
      }.not_to change { Notification.count }
    end

    it "does not create notification when status changes to in_progress" do
      ticket = create(:ticket, :assigned)

      expect {
        ticket.update!(status: :in_progress)
      }.not_to change { Notification.count }
    end
  end
end
