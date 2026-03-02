# frozen_string_literal: true

require "rails_helper"

RSpec.describe "GraphQL API", type: :request do
  describe "POST /graphql" do
    it "executes a query" do
      post "/graphql", params: { query: "{ __typename }" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"]["__typename"]).to eq("Query")
    end

    it "executes mutation with authentication" do
      customer = create(:user, email: "customer@test.com", password: "password123", password_confirmation: "password123")
      token = JsonWebToken.encode(user_id: customer.id)

      query = <<~GQL
        mutation CreateTicket($input: CreateTicketInput!) {
          createTicket(input: $input) {
            ticket { id subject }
            errors
          }
        }
      GQL

      post "/graphql",
        params: {
          query: query,
          variables: {
            input: {
              subject: "Request from integration test",
              description: "Need help with my account"
            }
          }
        },
        headers: { "Authorization" => "Bearer #{token}" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["errors"]).to be_nil
      expect(json["data"]["createTicket"]["ticket"]["subject"]).to eq("Request from integration test")
      expect(json["data"]["createTicket"]["errors"]).to eq([])
    end

    it "sign in and create ticket flow" do
      create(:user, email: "flow@test.com", password: "secret123", password_confirmation: "secret123")

      sign_in_query = <<~GQL
        mutation SignIn($input: SignInInput!) {
          signIn(input: $input) {
            token
            user { email }
            errors
          }
        }
      GQL

      post "/graphql",
        params: {
          query: sign_in_query,
          variables: { input: { email: "flow@test.com", password: "secret123" } }
        }

      json = response.parsed_body
      token = json["data"]["signIn"]["token"]
      expect(token).to be_present

      create_query = <<~GQL
        mutation CreateTicket($input: CreateTicketInput!) {
          createTicket(input: $input) {
            ticket { id subject }
            errors
          }
        }
      GQL

      post "/graphql",
        params: {
          query: create_query,
          variables: {
            input: {
              subject: "Post-login ticket",
              description: "Created after signing in"
            }
          }
        },
        headers: { "Authorization" => "Bearer #{token}" }

      create_json = response.parsed_body
      expect(create_json["data"]["createTicket"]["ticket"]).to be_present
      expect(create_json["data"]["createTicket"]["ticket"]["subject"]).to eq("Post-login ticket")
    end

    it "agent can assign and update ticket status" do
      agent = create(:user, :agent)
      ticket = create(:ticket)
      token = JsonWebToken.encode(user_id: agent.id)

      assign_query = <<~GQL
        mutation AssignTicket($input: AssignTicketInput!) {
          assignTicket(input: $input) {
            ticket { id assignedAgent { id } }
            errors
          }
        }
      GQL

      post "/graphql",
        params: {
          query: assign_query,
          variables: {
            input: {
              ticketId: ticket.id.to_s,
              agentId: agent.id.to_s
            }
          }
        },
        headers: { "Authorization" => "Bearer #{token}" }

      expect(response.parsed_body["data"]["assignTicket"]["ticket"]["assignedAgent"]).to be_present

      status_query = <<~GQL
        mutation UpdateTicketStatus($input: UpdateTicketStatusInput!) {
          updateTicketStatus(input: $input) {
            ticket { id status }
            errors
          }
        }
      GQL

      post "/graphql",
        params: {
          query: status_query,
          variables: {
            input: {
              ticketId: ticket.id.to_s,
              status: "closed"
            }
          }
        },
        headers: { "Authorization" => "Bearer #{token}" }

      expect(response.parsed_body["data"]["updateTicketStatus"]["ticket"]["status"]).to eq("closed")
    end
  end
end