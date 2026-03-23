# frozen_string_literal: true

class TicketExport < ApplicationRecord
  RETENTION_PERIOD = 7.days

  belongs_to :user
  has_one_attached :file

  enum :status, { pending: 0, ready: 1, failed: 2 }

  def self.destroy_expired!(retention: RETENTION_PERIOD)
    where(created_at: ...retention.ago).find_each(&:destroy!)
  end
end
