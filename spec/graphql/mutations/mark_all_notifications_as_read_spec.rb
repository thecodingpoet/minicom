# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::MarkAllNotificationsAsRead, type: :graphql do
  before do
    allow(NotificationChannel).to receive(:broadcast_to)
  end

  let(:mutation) do
    <<~GQL
      mutation MarkAllNotificationsAsRead {
        markAllNotificationsAsRead(input: {}) {
          updatedCount
          errors
        }
      }
    GQL
  end

  it "marks all unread notifications as read" do
    user = create(:user)
    create_list(:notification, 3, recipient: user, read_at: nil)
    create(:notification, recipient: user, read_at: Time.current)

    result = execute_graphql(
      query: mutation,
      variables: {},
      context: { current_user: user }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["markAllNotificationsAsRead"]
    expect(data["updatedCount"]).to eq(3)
    expect(data["errors"]).to eq([])
    expect(user.notifications.unread.count).to eq(0)
  end

  it "returns 0 when no unread notifications" do
    user = create(:user)

    result = execute_graphql(
      query: mutation,
      variables: {},
      context: { current_user: user }
    )

    data = result["data"]["markAllNotificationsAsRead"]
    expect(data["updatedCount"]).to eq(0)
  end

  it "raises when unauthenticated" do
    result = execute_graphql(
      query: mutation,
      variables: {},
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
  end
end
