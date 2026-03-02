# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
    end

    private

    def find_verified_user
      token = request.params[:token]
      return reject_unauthorized_connection unless token.present?

      decoded = JsonWebToken.decode(token)
      return reject_unauthorized_connection unless decoded

      User.find_by(id: decoded[:user_id]) || reject_unauthorized_connection
    end
  end
end
