class Ticket < ApplicationRecord
  enum :status, { open: 0, in_progress: 1, closed: 2 }

  belongs_to :customer, class_name: "User"
  belongs_to :assigned_agent, class_name: "User", optional: true
  has_many :comments, dependent: :destroy
  has_many_attached :attachments

  validates :subject, :description, presence: true

  after_commit :broadcast_inbox, on: :create
  after_update :broadcast_ticket

  scope :assigned, -> { where.not(assigned_agent_id: nil) }
  scope :unassigned, -> { where(assigned_agent_id: nil) }

  def has_agent_comment?
    comments.joins(:user).where(users: { role: :agent }).exists?
  end

  def claim!(agent)
    updates = {}
    updates[:status] = :in_progress if open?
    updates[:assigned_agent_id] = agent.id if assigned_agent_id.nil?
    update!(updates) if updates.any?
  end

  def broadcast_inbox
    ActionCable.server.broadcast("inbox", { type: "new_ticket" })
  rescue StandardError => e
    Rails.logger.error("InboxChannel broadcast failed: #{e.message}")
  end

  def broadcast_ticket
    return unless saved_change_to_status? || saved_change_to_assigned_agent_id?
    TicketChannel.broadcast_to(self, { type: "update" })
  rescue StandardError => e
    Rails.logger.error("TicketChannel broadcast failed: #{e.message}")
  end
end
