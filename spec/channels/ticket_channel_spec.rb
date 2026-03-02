# frozen_string_literal: true

require "rails_helper"

RSpec.describe TicketChannel, type: :channel do
  let(:ticket) { create(:ticket) }

  it "subscribes when customer owns the ticket" do
    stub_connection(current_user: ticket.customer)
    subscribe(id: ticket.id)

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_for(ticket)
  end

  it "subscribes when agent" do
    agent = create(:user, :agent)
    stub_connection(current_user: agent)
    subscribe(id: ticket.id)

    expect(subscription).to be_confirmed
    expect(subscription).to have_stream_for(ticket)
  end

  it "rejects when customer does not own the ticket" do
    other_customer = create(:user)
    stub_connection(current_user: other_customer)
    subscribe(id: ticket.id)

    expect(subscription).to be_rejected
  end

  it "rejects when not authenticated" do
    stub_connection(current_user: nil)
    subscribe(id: ticket.id)

    expect(subscription).to be_rejected
  end
end
