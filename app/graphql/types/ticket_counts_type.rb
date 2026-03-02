# frozen_string_literal: true

module Types
  class TicketCountsType < Types::BaseObject
    field :open, Integer, null: false
    field :in_progress, Integer, null: false
    field :closed, Integer, null: false
    field :all, Integer, null: false
  end
end
