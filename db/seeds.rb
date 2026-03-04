if Rails.env.production?
  puts "Seeds are disabled in production."
  exit
end

SEED_PASSWORD = ENV.fetch("SEED_PASSWORD", "password123")

puts "Seeding database..."

ActiveRecord::Base.transaction do
  if Rails.env.development?
    puts "  Cleaning database..."
    DatabaseCleaner.strategy = :truncation
    DatabaseCleaner.clean
  end

  agent1 = User.create!(
    email: "agent@minicom.com",
    password: SEED_PASSWORD,
    password_confirmation: SEED_PASSWORD,
    first_name: "Sarah",
    last_name: "Agent",
    role: :agent
  )

  agent2 = User.create!(
    email: "agent2@minicom.com",
    password: SEED_PASSWORD,
    password_confirmation: SEED_PASSWORD,
    first_name: "Mike",
    last_name: "Support",
    role: :agent
  )

  customer = User.create!(
    email: "customer@minicom.com",
    password: SEED_PASSWORD,
    password_confirmation: SEED_PASSWORD,
    first_name: "John",
    last_name: "Doe",
    role: :customer
  )

  puts "  Users ready"

  ticket1 = Ticket.create!(
    customer: customer,
    subject: "Cannot login to my account",
    description: "I've been trying to login since yesterday but keep getting an error message saying 'Invalid credentials' even though I'm sure my password is correct.",
    status: :open
  )

  ticket2 = Ticket.create!(
    customer: customer,
    assigned_agent: agent1,
    subject: "Billing discrepancy on invoice #1234",
    description: "My latest invoice shows a charge of $99 but I'm on the $49/month plan. Please correct this.",
    status: :in_progress
  )

  ticket3 = Ticket.create!(
    customer: customer,
    assigned_agent: agent1,
    subject: "Password reset request",
    description: "I forgot my password and need help resetting it. I've tried the 'Forgot password' link but never received the email.",
    status: :in_progress
  )

  puts "  Tickets ready: open, in progress, closed"

  ticket2.comments.create!(user: agent1, body: "Hi John, thanks for reporting this. Let me look into your billing history and get back to you shortly.")
  ticket2.comments.create!(user: customer, body: "Thank you, I appreciate the quick response!")

  ticket3.comments.create!(user: agent1, body: "Glad we could help. Your password has been reset successfully.")
  ticket3.comments.create!(user: customer, body: "All set now, thanks!")

  ticket3.update!(status: :closed)

  puts "  Comments ready"
end

puts "Done. #{User.count} users, #{Ticket.count} tickets, #{Comment.count} comments"
puts ""
puts "Login: agent@minicom.com | agent2@minicom.com | customer@minicom.com"
puts "Password: #{SEED_PASSWORD}"
