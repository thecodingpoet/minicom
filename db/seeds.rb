puts "Seeding database..."

agent1 = User.find_or_create_by!(email: "agent@minicom.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.first_name = "Sarah"
  u.last_name = "Agent"
  u.role = :agent
end

agent2 = User.find_or_create_by!(email: "agent2@minicom.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.first_name = "Mike"
  u.last_name = "Support"
  u.role = :agent
end

customer = User.find_or_create_by!(email: "customer@minicom.com") do |u|
  u.password = "password123"
  u.password_confirmation = "password123"
  u.first_name = "John"
  u.last_name = "Doe"
  u.role = :customer
end

ticket1 = Ticket.find_or_create_by!(subject: "Cannot login to my account") do |t|
  t.customer = customer
  t.description = "I've been trying to login since yesterday but keep getting an error message saying 'Invalid credentials' even though I'm sure my password is correct."
  t.status = :open
end

ticket2 = Ticket.find_or_create_by!(subject: "Billing discrepancy on invoice #1234") do |t|
  t.customer = customer
  t.assigned_agent = agent1
  t.description = "My latest invoice shows a charge of $99 but I'm on the $49/month plan. Please correct this."
  t.status = :in_progress
end

unless ticket2.comments.exists?
  ticket2.comments.create!(user: agent1, body: "Hi John, thanks for reporting this. Let me look into your billing history and get back to you shortly.")
  ticket2.comments.create!(user: customer, body: "Thank you, I appreciate the quick response!")
end

puts "Seeded: #{User.count} users, #{Ticket.count} tickets, #{Comment.count} comments"
puts ""
puts "Login credentials:"
puts "  Agent:    agent@minicom.com / password123"
puts "  Agent 2:  agent2@minicom.com / password123"
puts "  Customer: customer@minicom.com / password123"
