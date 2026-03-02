# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::SignUp, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation SignUp($input: SignUpInput!) {
        signUp(input: $input) {
          token
          user { id email firstName lastName }
          errors
        }
      }
    GQL
  end

  it "creates a user and returns token when valid" do
    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          email: "newuser@example.com",
          password: "password123",
          passwordConfirmation: "password123",
          firstName: "Jane",
          lastName: "Doe"
        }
      },
      context: {}
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["signUp"]
    expect(data["token"]).to be_present
    expect(data["user"]["email"]).to eq("newuser@example.com")
    expect(data["user"]["firstName"]).to eq("Jane")
    expect(data["user"]["lastName"]).to eq("Doe")
    expect(data["errors"]).to eq([])

    expect(User.find_by(email: "newuser@example.com")).to be_present
    expect(User.find_by(email: "newuser@example.com").role).to eq("customer")
  end

  it "returns errors for duplicate email" do
    create(:user, email: "existing@example.com")

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          email: "existing@example.com",
          password: "password123",
          passwordConfirmation: "password123",
          firstName: "Jane",
          lastName: "Doe"
        }
      },
      context: {}
    )

    data = result["data"]["signUp"]
    expect(data["token"]).to be_nil
    expect(data["user"]).to be_nil
    expect(data["errors"]).not_to be_empty
  end

  it "returns errors for password mismatch" do
    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          email: "user@example.com",
          password: "password123",
          passwordConfirmation: "different",
          firstName: "Jane",
          lastName: "Doe"
        }
      },
      context: {}
    )

    data = result["data"]["signUp"]
    expect(data["token"]).to be_nil
    expect(data["errors"]).not_to be_empty
  end
end
