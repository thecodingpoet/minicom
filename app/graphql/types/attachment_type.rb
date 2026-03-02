module Types
  class AttachmentType < Types::BaseObject
    field :url, String, null: false
    field :filename, String, null: false
    field :content_type, String, null: false

    def url
      Rails.application.routes.url_helpers.rails_blob_url(object, host: "localhost:3000")
    end

    def filename
      object.filename.to_s
    end

    def content_type
      object.content_type
    end
  end
end
