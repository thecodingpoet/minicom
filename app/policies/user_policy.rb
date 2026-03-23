# frozen_string_literal: true

class UserPolicy < ApplicationPolicy
  def agent_access?
    user.agent?
  end
end
