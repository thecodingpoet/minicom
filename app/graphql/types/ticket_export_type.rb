# frozen_string_literal: true

module Types
  class TicketExportType < Types::BaseObject
    field :id, ID, null: false
    field :status, String, null: false
    field :download_url, String, null: true
    field :error_message, String, null: true

    def download_url
      return nil unless object.ready? && object.file.attached?

      opts = Rails.application.config.action_mailer.default_url_options || { host: "localhost", port: 3000 }
      host = opts[:port] ? "#{opts[:host]}:#{opts[:port]}" : opts[:host].to_s
      Rails.application.routes.url_helpers.rails_blob_url(
        object.file,
        host: host,
        disposition: :attachment,
        expires_in: 15.minutes
      )
    end
  end
end
