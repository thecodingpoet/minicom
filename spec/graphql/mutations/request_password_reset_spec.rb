# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::RequestPasswordReset do
  let(:user) { create(:user, email: "user@example.com") }
  let(:mutation) do
    <<~GQL
      mutation RequestPasswordReset($email: String!) {
        requestPasswordReset(input: { email: $email }) {
          success
          errors
        }
      }
    GQL
  end

  it "returns success for existing user and sends email" do
    result = execute_graphql(query: mutation, variables: { email: user.email })
    data = result["data"]["requestPasswordReset"]

    expect(data["success"]).to be true
    expect(data["errors"]).to eq([])

    token = user.password_reset_token
    expect(token).to be_present
    expect(User.find_by_password_reset_token(token)).to eq(user)
  end

  it "returns success for non-existing email (no email enumeration)" do
    result = execute_graphql(query: mutation, variables: { email: "nonexistent@example.com" })
    data = result["data"]["requestPasswordReset"]

    expect(data["success"]).to be true
    expect(data["errors"]).to eq([])
  end

  it "returns success for blank-like email" do
    result = execute_graphql(query: mutation, variables: { email: "  user@example.com  " })
    data = result["data"]["requestPasswordReset"]

    expect(data["success"]).to be true
  end
end
