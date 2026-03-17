module Types
  class QueryType < Types::BaseObject
    field :current_user, resolver: Resolvers::CurrentUserResolver
    field :ticket_counts, resolver: Resolvers::TicketCountsResolver
    field :tickets, resolver: Resolvers::TicketsResolver
    field :ticket, resolver: Resolvers::TicketResolver
    field :agents, resolver: Resolvers::AgentsResolver
    field :notifications, resolver: Resolvers::NotificationsResolver
    field :unread_notifications_count, resolver: Resolvers::UnreadNotificationsCountResolver
  end
end
