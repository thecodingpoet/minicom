# frozen_string_literal: true

require "rails_helper"

RSpec.describe NotificationChannel, type: :channel do
  it "subscribes for authenticated user" do
    user = create(:user)
    stub_connection(current_user: user)
    subscribe

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_for(user)
  end

  it "rejects when not authenticated" do
    stub_connection(current_user: nil)
    subscribe

    expect(subscription).to be_rejected
  end
end
