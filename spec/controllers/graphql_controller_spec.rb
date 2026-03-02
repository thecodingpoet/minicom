# frozen_string_literal: true

require "rails_helper"

RSpec.describe GraphqlController, type: :controller do
  describe "POST #execute" do
    let(:query) { "{ __typename }" }

    it "executes a query and returns JSON" do
      post :execute, params: { query: query }
      expect(response).to have_http_status(:ok)
      expect(response.media_type).to eq("application/json")
      json = response.parsed_body
      expect(json["data"]["__typename"]).to eq("Query")
    end

    it "sets current_user from valid Bearer token" do
      user = create(:user)
      token = JsonWebToken.encode(user_id: user.id)
      request.env["HTTP_AUTHORIZATION"] = "Bearer #{token}"

      post :execute, params: { query: "{ currentUser { email } }" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"]["currentUser"]["email"]).to eq(user.email)
    end

    it "returns null currentUser when token is missing" do
      post :execute, params: { query: "{ currentUser { email } }" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"]["currentUser"]).to be_nil
    end

    it "returns null currentUser when token is invalid" do
      request.env["HTTP_AUTHORIZATION"] = "Bearer invalid-token"

      post :execute, params: { query: "{ currentUser { email } }" }

      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json["data"]["currentUser"]).to be_nil
    end

    it "accepts variables as JSON string" do
      post :execute,
        params: {
          query: "query($id: ID!) { ticket(id: $id) { id } }",
          variables: { id: "1" }.to_json
        }

      expect(response).to have_http_status(:ok)
    end

    it "accepts variables as Hash" do
      post :execute,
        params: {
          query: "query($id: ID!) { ticket(id: $id) { id } }",
          variables: { "id" => "1" }
        }

      expect(response).to have_http_status(:ok)
    end
  end
end
