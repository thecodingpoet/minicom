class DailyTicketReminderJob < ApplicationJob
  queue_as :default

  def perform
    return if Ticket.active.none?

    User.agent.find_each { |agent| AgentDailyReminderJob.perform_later(agent.id) }
  end
end
