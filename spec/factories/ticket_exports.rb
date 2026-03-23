# frozen_string_literal: true

FactoryBot.define do
  factory :ticket_export do
    user factory: %i[user agent]

    trait :pending do
      status { :pending }
    end

    trait :ready do
      status { :ready }
      after(:create) do |export|
        export.file.attach(
          io: StringIO.new("Ticket ID,Subject\n1,Test\n"),
          filename: "closed-tickets-test.csv",
          content_type: "text/csv"
        )
      end
    end
  end
end
