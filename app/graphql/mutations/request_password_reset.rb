module Mutations
  class RequestPasswordReset < BaseMutation
    skip_authentication!
    argument :email, String, required: true

    field :success, Boolean, null: false
    field :errors, [ String ], null: false

    def resolve(email:)
      user = User.find_by(email: email.downcase.strip)

      if user
        token = user.password_reset_token
        PasswordResetMailer.reset_instructions(user, token).deliver_later
      end

      { success: true, errors: [] }
    end
  end
end
