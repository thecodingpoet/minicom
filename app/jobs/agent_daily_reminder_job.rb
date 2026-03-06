class AgentDailyReminderJob < ApplicationJob
  queue_as :default

  def perform(agent_id)
    agent = User.agent.find_by(id: agent_id)
    return unless agent

    tickets = Ticket.assigned_to_or_unassigned(agent)
    return if tickets.empty?

    TicketMailer.daily_reminder(agent, tickets.ids).deliver_later
  end
end
