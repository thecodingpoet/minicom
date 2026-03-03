source "https://rubygems.org"

gem "rails", "~> 8.0.4"
gem "propshaft"
gem "pg", "~> 1.1"
gem "puma", ">= 5.0"
gem "jsbundling-rails"
gem "turbo-rails"
gem "jbuilder"
gem "tzinfo-data", platforms: %i[ windows jruby ]
gem "solid_cache"
gem "solid_queue"
gem "solid_cable"
gem "bootsnap", require: false
gem "kamal", require: false
gem "thruster", require: false

gem "csv"
gem "bcrypt", "~> 3.1.7"
gem "jwt"
gem "graphql"
gem "apollo_upload_server", "~> 2.1"
gem "mission_control-jobs"
gem "dotenv-rails"

group :development, :test do
  gem "database_cleaner-active_record"
  gem "debug", platforms: %i[ mri windows ], require: "debug/prelude"
  gem "brakeman", require: false
  gem "rubocop-rails-omakase", require: false
  gem "rspec-rails", "~> 8.0"
  gem "factory_bot_rails"
  gem "faker"
  gem "shoulda-matchers", "~> 7.0"
end

group :development do
  gem "web-console"
  gem "letter_opener"
end
gem "graphiql-rails", group: :development
