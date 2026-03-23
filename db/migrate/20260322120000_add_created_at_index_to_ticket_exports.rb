# frozen_string_literal: true

class AddCreatedAtIndexToTicketExports < ActiveRecord::Migration[8.1]
  def change
    add_index :ticket_exports, :created_at
  end
end
