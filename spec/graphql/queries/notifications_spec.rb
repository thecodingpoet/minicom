# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Notifications queries", type: :graphql do
  before do
    allow(NotificationChannel).to receive(:broadcast_to)
  end

  describe "notifications" do
    let(:query) do
      <<~GQL
        query Notifications($unreadOnly: Boolean) {
          notifications(unreadOnly: $unreadOnly) {
            id
            action
            actor { fullName }
            ticketId
            ticketSubject
            readAt
            createdAt
          }
        }
      GQL
    end

    it "returns user's notifications" do
      user = create(:user)
      notification = create(:notification, recipient: user, action: "new_comment")
      create(:notification, recipient: create(:user))

      result = execute_graphql(
        query: query,
        variables: {},
        context: { current_user: user }
      )

      expect(result["errors"]).to be_nil
      expect(result["data"]["notifications"].size).to eq(1)
      expect(result["data"]["notifications"].first["action"]).to eq("new_comment")
    end

    it "filters by unread when unreadOnly is true" do
      user = create(:user)
      unread = create(:notification, recipient: user, read_at: nil)
      read = create(:notification, recipient: user, read_at: Time.current)

      result = execute_graphql(
        query: query,
        variables: { unreadOnly: true },
        context: { current_user: user }
      )

      expect(result["data"]["notifications"].size).to eq(1)
      expect(result["data"]["notifications"].first["id"]).to eq(unread.id.to_s)
    end

    it "raises when unauthenticated" do
      result = execute_graphql(query: query, variables: {}, context: {})

      expect(result["errors"]).to be_present
      expect(result["errors"].first["message"]).to eq("Authentication required")
    end
  end

  describe "unreadNotificationsCount" do
    let(:query) do
      <<~GQL
        query {
          unreadNotificationsCount
        }
      GQL
    end

    it "returns count of unread notifications" do
      user = create(:user)
      create_list(:notification, 3, recipient: user, read_at: nil)
      create(:notification, recipient: user, read_at: Time.current)

      result = execute_graphql(query: query, variables: {}, context: { current_user: user })

      expect(result["data"]["unreadNotificationsCount"]).to eq(3)
    end

    it "raises when unauthenticated" do
      result = execute_graphql(query: query, variables: {}, context: {})

      expect(result["errors"]).to be_present
    end
  end
end
