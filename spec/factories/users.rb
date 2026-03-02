# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    email { Faker::Internet.unique.email }
    password { "password123" }
    password_confirmation { "password123" }
    first_name { Faker::Name.first_name }
    last_name { Faker::Name.last_name }
    role { :customer }

    trait :agent do
      role { :agent }
    end

    trait :customer do
      role { :customer }
    end
  end
end
