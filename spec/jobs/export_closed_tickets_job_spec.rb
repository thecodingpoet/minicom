# frozen_string_literal: true

require "rails_helper"

RSpec.describe ExportClosedTicketsJob, type: :job do
  it "builds a CSV and marks the export ready" do
    agent = create(:user, :agent)
    customer = create(:user)
    ticket = create(:ticket, :closed, customer: customer, subject: "Export me")
    export = create(:ticket_export, :pending, user: agent)

    described_class.perform_now(export.id)

    export.reload
    expect(export).to be_ready
    expect(export.file).to be_attached
    body = export.file.download
    expect(body).to include("Export me")
    expect(body).to include(customer.email)
    expect(body).to include(ticket.id.to_s)
  end

  it "marks export failed when generation raises" do
    agent = create(:user, :agent)
    export = create(:ticket_export, :pending, user: agent)

    allow(Ticket).to receive(:closed).and_raise(StandardError, "boom")

    described_class.perform_now(export.id)

    export.reload
    expect(export).to be_failed
    expect(export.error_message).to include("boom")
  end
end
