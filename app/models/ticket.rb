class Ticket < ApplicationRecord
  enum :status, { open: 0, in_progress: 1, closed: 2 }

  belongs_to :customer, class_name: "User"
  belongs_to :assigned_agent, class_name: "User", optional: true
  has_many :comments, dependent: :destroy
  has_many_attached :attachments

  validates :subject, :description, presence: true

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
end
