# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::ResetPassword do
  include ActiveSupport::Testing::TimeHelpers

  let(:user) { create(:user, email: "user@example.com") }
  let(:raw_token) { user.password_reset_token }
  let(:mutation) do
    <<~GQL
      mutation ResetPassword($token: String!, $password: String!, $passwordConfirmation: String!) {
        resetPassword(input: { token: $token, password: $password, passwordConfirmation: $passwordConfirmation }) {
          token
          user { id email }
          errors
        }
      }
    GQL
  end

  it "resets password and returns token for valid token" do
    result = execute_graphql(
      query: mutation,
      variables: {
        token: raw_token,
        password: "newpassword123",
        passwordConfirmation: "newpassword123"
      }
    )
    data = result["data"]["resetPassword"]

    expect(data["errors"]).to eq([])
    expect(data["token"]).to be_present
    expect(data["user"]["email"]).to eq(user.email)

    user.reload
    expect(user.authenticate("newpassword123")).to eq(user)
  end

  it "returns error for invalid token" do
    result = execute_graphql(
      query: mutation,
      variables: {
        token: "invalid-token",
        password: "newpassword123",
        passwordConfirmation: "newpassword123"
      }
    )
    data = result["data"]["resetPassword"]

    expect(data["token"]).to be_nil
    expect(data["user"]).to be_nil
    expect(data["errors"]).to include("Invalid or expired reset link. Please request a new one.")
  end

  it "returns error for invalid password confirmation" do
    result = execute_graphql(
      query: mutation,
      variables: {
        token: raw_token,
        password: "newpassword123",
        passwordConfirmation: "different"
      }
    )
    data = result["data"]["resetPassword"]

    expect(data["token"]).to be_nil
    expect(data["errors"]).not_to be_empty
  end

  it "returns error for expired token" do
    raw_token # Force token generation first

    travel 16.minutes do
      result = execute_graphql(
        query: mutation,
        variables: {
          token: raw_token,
          password: "newpassword123",
          passwordConfirmation: "newpassword123"
        }
      )
      data = result["data"]["resetPassword"]

      expect(data["token"]).to be_nil
      expect(data["errors"]).to include("Invalid or expired reset link. Please request a new one.")
    end
  end
end
