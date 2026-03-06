class TicketMailer < ApplicationMailer
  def daily_reminder(agent, ticket_ids)
    @agent = agent
    @tickets = Ticket.where(id: ticket_ids).includes(:customer, :assigned_agent)
    mail(to: @agent.email, subject: "Daily Open Tickets Reminder")
  end
end
