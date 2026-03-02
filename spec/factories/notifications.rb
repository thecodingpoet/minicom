# frozen_string_literal: true

FactoryBot.define do
  factory :notification do
    association :recipient, factory: :user
    association :actor, factory: [:user, :agent]
    notifiable { create(:comment, :by_agent) }
    action { "new_comment" }

    trait :read do
      read_at { Time.current }
    end

    trait :unread do
      read_at { nil }
    end

    trait :for_ticket_closed do
      association :notifiable, factory: :ticket
      action { "ticket_closed" }
    end
  end
end
