# frozen_string_literal: true

class TicketPolicy < ApplicationPolicy
  def create?
    user.customer?
  end

  def show?
    user.agent? || record.customer_id == user.id
  end

  def assign?
    user.agent?
  end

  def update_status?
    user.agent?
  end

  def comment?
    user.agent? || record.customer_id == user.id
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      return scope.none unless user

      if user.agent?
        scope.all
      else
        scope.where(customer_id: user.id)
      end
    end
  end
end
