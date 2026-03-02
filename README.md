# Minicom

A ticket support system built with Rails 8, GraphQL, and ActionCable.

## Requirements

- Ruby 3.2.8
- PostgreSQL
- Node.js (for JavaScript bundling)

## Setup

1. **Clone and install dependencies**

   ```bash
   bundle install
   yarn install
   ```

2. **Create and setup the database**

   ```bash
   bin/rails db:create
   bin/rails db:migrate
   bin/rails db:seed   
   ```

3. **Start the server**

   ```bash
   bin/rails server
   ```

   - App: http://localhost:3000
   - GraphiQL: http://localhost:3000/graphiql
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
