# frozen_string_literal: true

require "rails_helper"

RSpec.describe PasswordResetMailer, type: :mailer do
  describe "#reset_instructions" do
    let(:user) { create(:user, email: "user@example.com", first_name: "Jane") }
    let(:raw_token) { user.password_reset_token }
    let(:mail) { described_class.reset_instructions(user, raw_token) }

    it "sends to the user's email" do
      expect(mail.to).to eq([ "user@example.com" ])
    end

    it "has the correct subject" do
      expect(mail.subject).to eq("Reset your Minicom password")
    end

    it "includes the reset URL with the token" do
      expect(mail.body.encoded).to include("reset-password")
      expect(mail.body.encoded).to include(CGI.escape(raw_token))
    end

    it "includes the user's first name" do
      expect(mail.body.encoded).to include("Hi Jane")
    end
  end
end
