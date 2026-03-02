# frozen_string_literal: true

FactoryBot.define do
  factory :ticket do
    association :customer, factory: :user
    subject { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    status { :open }

    trait :in_progress do
      status { :in_progress }
    end

    trait :closed do
      status { :closed }
    end

    trait :assigned do
      assigned_agent { create(:user, :agent) }
    end

    trait :unassigned do
      assigned_agent_id { nil }
    end

    trait :with_agent_comment do
      after(:create) do |ticket|
        agent = create(:user, :agent)
        create(:comment, ticket: ticket, user: agent)
      end
    end
  end
end
