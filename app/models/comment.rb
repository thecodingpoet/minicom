class Comment < ApplicationRecord
  belongs_to :ticket
  belongs_to :user

  validates :body, presence: true
  validate :customer_can_comment

  after_create :claim_ticket_if_agent
  after_commit :broadcast_ticket_update, on: :create
  after_commit :create_notification, on: :create

  private

  def broadcast_ticket_update
    TicketChannel.broadcast_to(ticket, { type: "update", actor_id: user.id })
  rescue StandardError => e
    Rails.logger.error("TicketChannel broadcast failed: #{e.message}")
  end

  def customer_can_comment
    return unless user&.customer?
    return if ticket&.has_agent_comment?

    errors.add(:base, "Customers cannot comment until an agent has responded")
  end

  def claim_ticket_if_agent
    return unless user.agent?
    ticket.claim!(user)
  end

  def create_notification
    return unless notification_recipient

    Notification.create!(
      recipient: notification_recipient,
      actor: user,
      notifiable: self,
      action: "new_comment"
    )
  rescue StandardError => e
    Rails.logger.error("Comment notification failed: #{e.message}")
  end

  def notification_recipient
    if user.agent?
      ticket.customer
    elsif ticket.assigned_agent.present?
      ticket.assigned_agent
    end
  end
end
