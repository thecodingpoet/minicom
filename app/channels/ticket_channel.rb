# frozen_string_literal: true

class TicketChannel < ApplicationCable::Channel
  def subscribed
    ticket = Ticket.find(params[:id])
    if can_access?(ticket)
      stream_for ticket
    else
      reject
    end
  end

  def unsubscribed
    stop_all_streams
  end

  private

  def can_access?(ticket)
    return false unless current_user

    current_user.agent? || ticket.customer_id == current_user.id
  end
end
