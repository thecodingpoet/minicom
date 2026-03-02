class User < ApplicationRecord
  has_secure_password

  enum :role, { customer: 0, agent: 1 }

  has_many :tickets, foreign_key: :customer_id, dependent: :destroy
  has_many :assigned_tickets, class_name: "Ticket", foreign_key: :assigned_agent_id, dependent: :nullify
  has_many :comments, dependent: :destroy

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :first_name, :last_name, presence: true
  validates :role, presence: true

  def full_name
    "#{first_name} #{last_name}"
  end
end
