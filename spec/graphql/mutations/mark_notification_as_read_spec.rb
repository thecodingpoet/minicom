# frozen_string_literal: true

require "rails_helper"

RSpec.describe Mutations::MarkNotificationAsRead, type: :graphql do
  before do
    allow(NotificationChannel).to receive(:broadcast_to)
  end

  let(:mutation) do
    <<~GQL
      mutation MarkNotificationAsRead($input: MarkNotificationAsReadInput!) {
        markNotificationAsRead(input: $input) {
          notification { id readAt }
          errors
        }
      }
    GQL
  end

  it "marks notification as read" do
    user = create(:user)
    notification = create(:notification, recipient: user, read_at: nil)

    result = execute_graphql(
      query: mutation,
      variables: { input: { notificationId: notification.id.to_s } },
      context: { current_user: user }
    )

    expect(result["errors"]).to be_nil
    data = result["data"]["markNotificationAsRead"]
    expect(data["notification"]["readAt"]).to be_present
    expect(data["errors"]).to eq([])
    expect(notification.reload.read_at).to be_present
  end

  it "raises when unauthenticated" do
    result = execute_graphql(
      query: mutation,
      variables: { input: { notificationId: "1" } },
      context: {}
    )

    expect(result["errors"]).to be_present
    expect(result["errors"].first["message"]).to eq("Authentication required")
  end

  it "raises when notification belongs to another user" do
    user = create(:user)
    other_user = create(:user)
    notification = create(:notification, recipient: other_user)

    expect {
      execute_graphql(
        query: mutation,
        variables: { input: { notificationId: notification.id.to_s } },
        context: { current_user: user }
      )
    }.to raise_error(ActiveRecord::RecordNotFound)
  end
end
