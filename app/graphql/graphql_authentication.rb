# frozen_string_literal: true

# Include after PunditHelpers on GraphQL resolvers/mutations. Enforces login in #ready?
# unless the subclass calls `skip_authentication!` (e.g. sign-in, currentUser).
module GraphqlAuthentication
  extend ActiveSupport::Concern

  included do
    class_attribute :skip_authentication, instance_accessor: false, default: false
  end

  class_methods do
    def skip_authentication!
      self.skip_authentication = true
    end
  end

  def ready?(**kwargs)
    require_authentication! unless self.class.skip_authentication
    super
  end

  def authorize!(record, query, message: "Not authorized", require_login: false)
    super
  end
end
