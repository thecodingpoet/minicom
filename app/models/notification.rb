# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :recipient, class_name: "User"
  belongs_to :actor, class_name: "User"
  belongs_to :notifiable, polymorphic: true

  validates :action, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  after_commit :broadcast_to_recipient, on: :create

  def mark_as_read!
    update!(read_at: Time.current) unless read_at?
  end

  def ticket
    case notifiable
    when Comment then notifiable.ticket
    when Ticket then notifiable
    end
  end

  private

  def broadcast_to_recipient
    NotificationChannel.broadcast_to(recipient, {
      id: id,
      action: action,
      actor_name: actor.full_name,
      ticket_id: ticket&.id,
      ticket_subject: ticket&.subject,
      created_at: created_at.iso8601
    })
  rescue StandardError => e
    Rails.logger.error("NotificationChannel broadcast failed: #{e.message}")
  end
end
