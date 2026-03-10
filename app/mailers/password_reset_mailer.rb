class PasswordResetMailer < ApplicationMailer
  def reset_instructions(user, raw_token)
    @user = user
    @reset_url = "#{root_url}reset-password?token=#{CGI.escape(raw_token)}"
    mail(to: @user.email, subject: "Reset your Minicom password")
  end
end
