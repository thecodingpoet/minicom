# frozen_string_literal: true

module PunditHelpers
  def require_authentication!
    raise GraphQL::ExecutionError, "Authentication required" unless context[:current_user]
  end

  def current_user
    context[:current_user]
  end

  def authorize!(record, query, message: "Not authorized", require_login: true)
    require_authentication! if require_login
    policy = Pundit.policy!(current_user, record)
    raise GraphQL::ExecutionError, message unless policy.public_send(query)

    record
  end

  def policy_scope(scope)
    require_authentication!
    Pundit.policy_scope!(current_user, scope)
  end
end
