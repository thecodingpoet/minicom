class TicketMailer < ApplicationMailer
  def daily_reminder(agent, tickets)
    @agent = agent
    @tickets = tickets
    mail(to: @agent.email, subject: "Daily Open Tickets Reminder")
  end
end
