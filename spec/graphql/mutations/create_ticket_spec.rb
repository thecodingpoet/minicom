# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::CreateTicket, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation CreateTicket($input: CreateTicketInput!) {
        createTicket(input: $input) {
          ticket { id subject description }
          errors
        }
      }
    GQL
  end

  it "creates a ticket when authenticated as customer" do
    customer = create(:user)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          subject: "Help needed",
          description: "I need assistance with my account"
        }
      },
      context: { current_user: customer }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["createTicket"]
    expect(data["ticket"]["subject"]).to eq("Help needed")
    expect(data["ticket"]["description"]).to eq("I need assistance with my account")
    expect(data["errors"]).to eq([])
    expect(customer.tickets.count).to eq(1)
  end

  it "raises when unauthenticated" do
    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          subject: "Help",
          description: "Need help"
        }
      },
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
    expect(result["data"]["createTicket"]).to be_nil
  end

  it "raises when authenticated as agent" do
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          subject: "Help",
          description: "Need help"
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Only customers can create tickets")
  end

  it "returns validation errors for invalid input" do
    customer = create(:user)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          subject: "",
          description: ""
        }
      },
      context: { current_user: customer }
    )

    data = result["data"]["createTicket"]
    expect(data["ticket"]).to be_nil
    expect(data["errors"]).not_to be_empty
  end
end
