# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::CreateComment, type: :graphql do
  let(:mutation) do
    <<~GQL
      mutation CreateComment($input: CreateCommentInput!) {
        createComment(input: $input) {
          comment { id body }
          errors
        }
      }
    GQL
  end

  it "creates a comment when authenticated" do
    ticket = create(:ticket, :with_agent_comment)
    customer = ticket.customer

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          body: "Customer reply"
        }
      },
      context: { current_user: customer }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["createComment"]
    expect(data["comment"]["body"]).to eq("Customer reply")
    expect(data["errors"]).to eq([])
  end

  it "creates a comment when agent creates first comment" do
    ticket = create(:ticket)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          body: "Agent response"
        }
      },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["createComment"]
    expect(data["comment"]["body"]).to eq("Agent response")
    expect(ticket.reload.assigned_agent_id).to eq(agent.id)
  end

  it "raises when unauthenticated" do
    ticket = create(:ticket)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          body: "Comment"
        }
      },
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
  end

  it "returns validation errors when customer comments before agent" do
    ticket = create(:ticket)
    customer = ticket.customer

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          body: "Customer reply"
        }
      },
      context: { current_user: customer }
    )

    data = result["data"]["createComment"]
    expect(data["comment"]).to be_nil
    expect(data["errors"]).to include("Customers cannot comment until an agent has responded")
  end

  it "returns validation errors when commenting on closed ticket" do
    ticket = create(:ticket, :with_agent_comment)
    ticket.update!(status: :closed)
    customer = ticket.customer

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          body: "Customer reply"
        }
      },
      context: { current_user: customer }
    )

    data = result["data"]["createComment"]
    expect(data["comment"]).to be_nil
    expect(data["errors"]).to include("Cannot comment on a closed ticket")
  end

  it "returns validation errors when agent tries to comment on closed ticket" do
    ticket = create(:ticket, :closed)
    agent = create(:user, :agent)

    result = execute_graphql(
      query: mutation,
      variables: {
        input: {
          ticketId: ticket.id.to_s,
          body: "Agent reply"
        }
      },
      context: { current_user: agent }
    )

    data = result["data"]["createComment"]
    expect(data["comment"]).to be_nil
    expect(data["errors"]).to include("Cannot comment on a closed ticket")
  end
end
