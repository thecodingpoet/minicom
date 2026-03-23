module Mutations
  class ResetPassword < BaseMutation
    skip_authentication!
    argument :token, String, required: true
    argument :password, String, required: true
    argument :password_confirmation, String, required: true

    field :token, String, null: true
    field :user, Types::UserType, null: true
    field :errors, [ String ], null: false

    def resolve(token:, password:, password_confirmation:)
      user = User.find_by_password_reset_token(token)
      return { token: nil, user: nil, errors: [ I18n.t("errors.invalid_reset_token") ] } if user.blank?

      user.password = password
      user.password_confirmation = password_confirmation

      if user.save
        { token: JsonWebToken.encode(user_id: user.id), user: user, errors: [] }
      else
        { token: nil, user: nil, errors: user.errors.full_messages }
      end
    end
  end
end
