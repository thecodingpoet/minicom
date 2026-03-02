# frozen_string_literal: true

require "rails_helper"

RSpec.describe Notification, type: :model do
  before do
    allow(NotificationChannel).to receive(:broadcast_to)
  end

  describe "validations" do
    it { is_expected.to validate_presence_of(:action) }
  end

  describe "associations" do
    it { is_expected.to belong_to(:recipient).class_name("User") }
    it { is_expected.to belong_to(:actor).class_name("User") }
    it { is_expected.to belong_to(:notifiable) }
  end

  describe "scopes" do
    let!(:unread) { create(:notification, :unread) }
    let!(:read) { create(:notification, :read) }

    describe ".unread" do
      it "returns only unread notifications" do
        expect(described_class.unread).to include(unread)
        expect(described_class.unread).not_to include(read)
      end
    end

    describe ".recent" do
      it "orders by created_at descending" do
        recipient = create(:user)
        older = create(:notification, recipient: recipient, created_at: 1.hour.ago)
        newer = create(:notification, recipient: recipient, created_at: 1.minute.ago)

        results = recipient.notifications.recent
        expect(results.first).to eq(newer)
        expect(results.last).to eq(older)
      end
    end
  end

  describe "#mark_as_read!" do
    it "sets read_at to current time" do
      notification = create(:notification, read_at: nil)
      expect { notification.mark_as_read! }.to change { notification.reload.read_at }.from(nil)
      expect(notification.read_at).to be_within(2.seconds).of(Time.current)
    end

    it "does nothing if already read" do
      original_time = 1.hour.ago
      notification = create(:notification, read_at: original_time)
      notification.mark_as_read!
      expect(notification.reload.read_at).to be_within(1.second).of(original_time)
    end
  end

  describe "#ticket" do
    it "returns the comment's ticket when notifiable is a Comment" do
      comment = create(:comment, :by_agent)
      notification = create(:notification, notifiable: comment)
      expect(notification.ticket).to eq(comment.ticket)
    end

    it "returns the ticket when notifiable is a Ticket" do
      ticket = create(:ticket)
      notification = create(:notification, notifiable: ticket, action: "ticket_closed")
      expect(notification.ticket).to eq(ticket)
    end
  end

  describe "broadcast callback" do
    it "broadcasts to NotificationChannel on create" do
      recipient = create(:user)
      actor = create(:user, :agent)
      comment = create(:comment, user: actor)

      expect(NotificationChannel).to receive(:broadcast_to).with(
        recipient,
        hash_including(action: "new_comment", actor_name: actor.full_name)
      )

      create(:notification, recipient: recipient, actor: actor, notifiable: comment, action: "new_comment")
    end
  end
end
