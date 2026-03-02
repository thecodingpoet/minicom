module Types
  class MutationType < Types::BaseObject
    field :sign_up, mutation: Mutations::SignUp
    field :sign_in, mutation: Mutations::SignIn
    field :create_ticket, mutation: Mutations::CreateTicket
    field :create_comment, mutation: Mutations::CreateComment
    field :update_ticket_status, mutation: Mutations::UpdateTicketStatus
    field :assign_ticket, mutation: Mutations::AssignTicket
    field :export_closed_tickets, mutation: Mutations::ExportClosedTickets
    field :mark_notification_as_read, mutation: Mutations::MarkNotificationAsRead
    field :mark_all_notifications_as_read, mutation: Mutations::MarkAllNotificationsAsRead
  end
end
