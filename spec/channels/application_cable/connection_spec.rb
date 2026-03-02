# frozen_string_literal: true

require "rails_helper"

RSpec.describe ApplicationCable::Connection, type: :channel do
  let(:user) { create(:user) }

  it "connects with valid token" do
    token = JsonWebToken.encode(user_id: user.id)
    connect "/cable", params: { token: token }

    expect(connection.current_user).to eq(user)
  end

  it "rejects connection when token is missing" do
    expect { connect "/cable", params: {} }.to have_rejected_connection
  end

  it "rejects connection when token is invalid" do
    expect { connect "/cable", params: { token: "invalid" } }.to have_rejected_connection
  end

  it "rejects connection when user not found" do
    token = JsonWebToken.encode(user_id: 999_999)
    expect { connect "/cable", params: { token: token } }.to have_rejected_connection
  end
end
