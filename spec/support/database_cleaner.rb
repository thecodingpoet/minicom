require "database_cleaner-active_record"

RSpec.configure do |config|
  config.use_transactional_fixtures = false

  config.before(:suite) { DatabaseCleaner.clean_with(:truncation) }

  config.around(:each) { |example| DatabaseCleaner.cleaning { example.run } }
end
