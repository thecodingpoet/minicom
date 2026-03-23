# frozen_string_literal: true

class TicketExportPolicy < ApplicationPolicy
  def create?
    user.agent?
  end
end
