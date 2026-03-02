module Types
  class AttachmentType < Types::BaseObject
    field :url, String, null: false
    field :filename, String, null: false
    field :content_type, String, null: false

    def url
      opts = Rails.application.config.action_mailer.default_url_options || { host: "localhost", port: 3000 }
      host = opts[:port] ? "#{opts[:host]}:#{opts[:port]}" : opts[:host]
      Rails.application.routes.url_helpers.rails_blob_url(object, host: host)
    end

    def filename
      object.filename.to_s
    end

    def content_type
      object.content_type
    end
  end
end
