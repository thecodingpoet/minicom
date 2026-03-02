# frozen_string_literal: true

require "rails_helper"

RSpec.describe TicketMailer, type: :mailer do
  describe "#daily_reminder" do
    let(:agent) { create(:user, :agent) }
    let(:tickets) { create_list(:ticket, 2, :assigned, assigned_agent: agent) }
    let(:mail) { described_class.daily_reminder(agent, tickets) }

    it "sends to the agent's email" do
      expect(mail.to).to eq([ agent.email ])
    end

    it "has the correct subject" do
      expect(mail.subject).to eq("Daily Open Tickets Reminder")
    end

    it "includes ticket information in the body" do
      expect(mail.body.encoded).to include(tickets.first.subject)
      expect(mail.body.encoded).to include(tickets.second.subject)
    end

    it "includes agent first name" do
      expect(mail.body.encoded).to include(agent.first_name)
    end
  end
end
