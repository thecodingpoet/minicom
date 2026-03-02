# frozen_string_literal: true

class InboxChannel < ApplicationCable::Channel
  def subscribed
    return reject unless current_user&.agent?

    stream_from "inbox"
  end

  def unsubscribed
    stop_all_streams
  end
end
