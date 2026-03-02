# frozen_string_literal: true

FactoryBot.define do
  factory :comment do
    association :ticket
    association :user
    body { Faker::Lorem.paragraph }

    trait :by_agent do
      user { create(:user, :agent) }
    end

    trait :by_customer do
      association :user, factory: :user
    end
  end
end
