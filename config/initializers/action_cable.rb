# frozen_string_literal: true

# Eager load channels so they're available when Action Cable handles subscriptions.
# In development with eager_load: false, channels may not be autoloaded in the
# cable connection context.
Rails.application.config.after_initialize do
  # Force load channel classes so Action Cable can find them
  Dir[Rails.root.join("app/channels/**/*.rb")].sort.each { |f| load f }
end
