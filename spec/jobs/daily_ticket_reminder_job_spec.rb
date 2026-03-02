# frozen_string_literal: true

require "rails_helper"

RSpec.describe DailyTicketReminderJob, type: :job do
  include ActiveJob::TestHelper

  it "sends reminder to agents with assigned tickets" do
    agent = create(:user, :agent)
    ticket = create(:ticket, :assigned, assigned_agent: agent)

    expect {
      perform_enqueued_jobs { described_class.perform_now }
    }.to change { ActionMailer::Base.deliveries.size }.by(1)

    mail = ActionMailer::Base.deliveries.last
    expect(mail.to).to eq([ agent.email ])
    expect(mail.subject).to eq("Daily Open Tickets Reminder")
  end

  it "sends reminder to agents with unassigned tickets" do
    agent = create(:user, :agent)
    create(:ticket, assigned_agent_id: nil)

    expect {
      perform_enqueued_jobs { described_class.perform_now }
    }.to change { ActionMailer::Base.deliveries.size }.by(1)

    mail = ActionMailer::Base.deliveries.last
    expect(mail.to).to eq([ agent.email ])
  end

  it "does nothing when no open tickets" do
    create(:ticket, :closed)

    expect {
      perform_enqueued_jobs { described_class.perform_now }
    }.not_to change { ActionMailer::Base.deliveries.size }
  end

  it "does not send to agents with no relevant tickets" do
    agent_with_tickets = create(:user, :agent)
    agent_without_tickets = create(:user, :agent)
    create(:ticket, :assigned, assigned_agent: agent_with_tickets)

    perform_enqueued_jobs { described_class.perform_now }

    expect(ActionMailer::Base.deliveries.map(&:to).flatten).to include(agent_with_tickets.email)
    expect(ActionMailer::Base.deliveries.map(&:to).flatten).not_to include(agent_without_tickets.email)
  end
end
