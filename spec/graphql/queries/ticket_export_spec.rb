# frozen_string_literal: true

require "rails_helper"

RSpec.describe "ticketExport query", type: :graphql do
  let(:query) do
    <<~GQL
      query TicketExport($id: ID!) {
        ticketExport(id: $id) {
          id
          status
          downloadUrl
          errorMessage
        }
      }
    GQL
  end

  it "returns the export for the owning user" do
    agent = create(:user, :agent)
    export = create(:ticket_export, :ready, user: agent)

    result = execute_graphql(
      query: query,
      variables: { id: export.id.to_s },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["ticketExport"]
    expect(data["id"]).to eq(export.id.to_s)
    expect(data["status"]).to eq("ready")
    expect(data["downloadUrl"]).to be_present
  end

  it "returns null when the export belongs to another user" do
    agent = create(:user, :agent)
    other = create(:user, :agent)
    export = create(:ticket_export, :ready, user: other)

    result = execute_graphql(
      query: query,
      variables: { id: export.id.to_s },
      context: { current_user: agent }
    )

    expect(result["errors"]).to be_nil
    expect(result["data"]["ticketExport"]).to be_nil
  end

  it "raises when unauthenticated" do
    export = create(:ticket_export, :ready, user: create(:user, :agent))

    result = execute_graphql(
      query: query,
      variables: { id: export.id.to_s },
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
  end
end
