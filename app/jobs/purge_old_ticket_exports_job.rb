# frozen_string_literal: true

class PurgeOldTicketExportsJob < ApplicationJob
  queue_as :default

  def perform
    TicketExport.destroy_expired!
  end
end
