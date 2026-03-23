# frozen_string_literal: true

class TicketExport < ApplicationRecord
  belongs_to :user
  has_one_attached :file

  enum :status, { pending: 0, ready: 1, failed: 2 }
end
