# Minicom

A ticket support system built with Rails 8, GraphQL, and ActionCable.

## Requirements

- Ruby 3.3.7
- PostgreSQL
- Node.js (for JavaScript bundling)

## Setup

1. **Clone and install dependencies**

   ```bash
   bundle install
   npm install
   ```

2. **Create and setup the database**

   ```bash
   bin/rails db:create
   bin/rails db:migrate
   bin/rails db:seed   
   ```

3. **Environment variables**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   | Variable | Description |
   |----------|-------------|
   | `MISSION_CONTROL_JOBS_USER` | Username for the Mission Control Jobs dashboard |
   | `MISSION_CONTROL_JOBS_PASSWORD` | Password for the Mission Control Jobs dashboard |
   | `SOLID_QUEUE_IN_PUMA` | Set to `true` to run Solid Queue inside the Puma process instead of as a separate worker |

4. **Start the server**

   ```bash
   bin/rails server
   ```

   - App: http://localhost:3000
   - GraphiQL: http://localhost:3000/graphiql
   - Mission Control Jobs: http://localhost:3000/jobs (requires `.env` credentials)
   - ActionCable: ws://localhost:3000/cable

## Running Tests

```bash
# Run the full test suite
bundle exec rspec

# Run specific specs
bundle exec rspec spec/models/
bundle exec rspec spec/graphql/
bundle exec rspec spec/requests/
```

The test suite uses RSpec with Factory Bot, Faker, and Shoulda Matchers. Ensure the test database exists:

```bash
RAILS_ENV=test bin/rails db:create db:schema:load
```
