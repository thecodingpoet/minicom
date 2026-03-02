class Comment < ApplicationRecord
  belongs_to :ticket
  belongs_to :user

  validates :body, presence: true
  validate :customer_can_comment

  after_create :claim_ticket_if_agent

  private

  def customer_can_comment
    return unless user&.customer?
    return if ticket&.has_agent_comment?

    errors.add(:base, "Customers cannot comment until an agent has responded")
  end

  def claim_ticket_if_agent
    return unless user.agent?
    ticket.claim!(user)
  end
end
