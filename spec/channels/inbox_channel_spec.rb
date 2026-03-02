# frozen_string_literal: true

require "rails_helper"

RSpec.describe InboxChannel, type: :channel do
  it "subscribes when agent" do
    agent = create(:user, :agent)
    stub_connection(current_user: agent)
    subscribe

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_from("inbox")
  end

  it "rejects when customer" do
    customer = create(:user)
    stub_connection(current_user: customer)
    subscribe

    expect(subscription).to be_rejected
  end

  it "rejects when not authenticated" do
    stub_connection(current_user: nil)
    subscribe

    expect(subscription).to be_rejected
  end
end