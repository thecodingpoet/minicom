class DailyTicketReminderJob < ApplicationJob
  queue_as :default

  def perform
    open_tickets = Ticket.where(status: [ :open, :in_progress ]).includes(:customer, :assigned_agent)
    return if open_tickets.empty?

    User.agent.find_each do |agent|
      agent_tickets = open_tickets.where(assigned_agent_id: agent.id)
      unassigned = open_tickets.unassigned

      tickets_to_report = (agent_tickets + unassigned).uniq
      next if tickets_to_report.empty?

      TicketMailer.daily_reminder(agent, tickets_to_report).deliver_later
    end
  end
end
