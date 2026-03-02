# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::SignIn, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation SignIn($input: SignInInput!) {
        signIn(input: $input) {
          token
          user { id email }
          errors
        }
      }
    GQL
  end

  it "returns token and user for valid credentials" do
    user = create(:user, email: "agent@example.com", password: "secret123", password_confirmation: "secret123")

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          email: "agent@example.com",
          password: "secret123"
        }
      },
      context: {}
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["signIn"]
    expect(data["token"]).to be_present
    expect(data["user"]["email"]).to eq("agent@example.com")
    expect(data["errors"]).to eq([])
  end

  it "returns errors for invalid password" do
    create(:user, email: "user@example.com")

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          email: "user@example.com",
          password: "wrongpassword"
        }
      },
      context: {}
    )

    data = result["data"]["signIn"]
    expect(data["token"]).to be_nil
    expect(data["user"]).to be_nil
    expect(data["errors"]).to include("Invalid email or password")
  end

  it "returns errors for non-existent email" do
    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          email: "nonexistent@example.com",
          password: "password123"
        }
      },
      context: {}
    )

    data = result["data"]["signIn"]
    expect(data["token"]).to be_nil
    expect(data["errors"]).to include("Invalid email or password")
  end
end
