# Support Ticket System Implementation Plan

## Architecture Overview

The application will be split into:

- **Backend**: Ruby on Rails API with GraphQL
- **Frontend**: React application with Shoelace components
- **Database**: PostgreSQL (single database for app + Solid Queue jobs)
- **File Storage**: Local storage (development)
- **Email**: ActionMailer with SMTP
- **Background Jobs**: Solid Queue (database-backed, uses same PostgreSQL database) with Mission Control UI

## Backend Implementation (Rails + GraphQL)

### 1. Project Setup

- Initialize Rails 8 API-only application
- Configure PostgreSQL database
- Set up GraphQL with `graphql-ruby` gem
- Configure CORS for frontend communication
- Set up Active Storage for file attachments
- Install and configure Solid Queue gem
- Mount Mission Control for job management UI

### 2. Database Schema

**Users Table**

- `id` (primary key)
- `email` (string, unique, indexed)
- `password_digest` (string)
- `role` (enum: 'customer', 'agent')
- `first_name` (string)
- `last_name` (string)
- `created_at`, `updated_at`

**Tickets Table**

- `id` (primary key)
- `customer_id` (foreign key to users)
- `assigned_agent_id` (foreign key to users, nullable, indexed)
- `subject` (string)
- `description` (text)
- `status` (enum: 'open', 'in_progress', 'closed')
- `created_at`, `updated_at`

**Comments Table**

- `id` (primary key)
- `ticket_id` (foreign key to tickets)
- `user_id` (foreign key to users)
- `body` (text)
- `created_at`, `updated_at`

**Attachments Table** (via Active Storage)

- Rails Active Storage will handle `active_storage_blobs` and `active_storage_attachments`

### 3. Models

**User Model** (`app/models/user.rb`)

- Use `bcrypt` for password hashing
- Enum for role
- Associations: `has_many :tickets` (as customer), `has_many :assigned_tickets` (as agent, class_name: 'Ticket', foreign_key: 'assigned_agent_id'), `has_many :comments`
- Validations: email format, presence, first_name and last_name presence
- Methods: `full_name` (concatenate first_name and last_name), `agent?` (check if role is agent)

**Ticket Model** (`app/models/ticket.rb`)

- Associations: `belongs_to :customer`, `belongs_to :assigned_agent` (optional, class_name: 'User'), `has_many :comments`, `has_many_attached :attachments`
- Enum for status
- Scopes: `open`, `closed`, `in_progress`, `assigned`, `unassigned`
- Method: `has_agent_comment?` (check if any comment is from an agent)

**Comment Model** (`app/models/comment.rb`)

- Associations: `belongs_to :ticket`, `belongs_to :user`
- Validations: body presence
- Custom validation: `validate_customer_can_comment` (check if customer can comment - must have agent comment first)
- Callback: `after_create :update_ticket_status_if_agent` (auto-update ticket to 'in_progress' if agent comments)

**Note on Service Objects**: Start with simple implementation in models and GraphQL mutations. Refactor to service objects later if complexity grows or code duplication occurs. Only create service objects when absolutely necessary (e.g., complex CSV export logic).

### 4. GraphQL Schema

**Types** (`app/graphql/types/`)

- `UserType`: id, email, firstName, lastName, fullName, role
- `TicketType`: id, subject, description, status, customer, assignedAgent, comments, attachments, created_at
- `CommentType`: id, body, user, created_at
- `AttachmentType`: url, filename, content_type

**Queries** (`app/graphql/types/query_type.rb`)

- `currentUser`: Get authenticated user
- `tickets`: List tickets (filtered by role - customers see their own, agents see all)
- `ticket(id:)`: Get single ticket with comments
- `closedTickets`: For CSV export (last month)
- `agents`: List all agents (for assignment dropdown)

**Mutations** (`app/graphql/types/mutation_type.rb`)

Mutations handle business logic directly:

- `signUp`: Create user, validate input, hash password, return user and token
- `signIn`: Authenticate credentials, generate JWT token, return user and token
- `createTicket`: Create ticket with attachments, validate customer, handle file uploads
- `createComment`: Create comment, validate business rules (customer can only comment if agent has commented), update ticket status if agent comments
- `updateTicketStatus`: Update status, validate agent permissions
- `assignTicket`: Assign ticket to agent, validate agent role, handle unassignment
- `exportClosedTickets`: Query closed tickets, generate CSV (consider service object here if logic becomes complex)

Each mutation:

- Validates GraphQL input
- Performs business logic
- Handles errors and returns appropriate GraphQL response

### 5. Authentication

- Use JWT tokens via `jwt` gem
- Create `GraphqlController` with authentication concern
- Token-based auth for GraphQL requests
- Password reset functionality (optional enhancement)

### 6. File Uploads

- Configure Active Storage with local disk service
- GraphQL mutation accepts file uploads
- Validate file types (images, PDFs) and sizes in GraphQL mutation or model
- Attach files via Active Storage in `createTicket` mutation
- Generate signed URLs for file access in GraphQL types

### 7. CSV Export

- Implement CSV generation in GraphQL mutation or create a simple service class if logic becomes complex
- Query closed tickets from last 30 days
- Generate CSV with: ticket ID, subject, customer email, status, created_at, closed_at
- Return CSV as downloadable response via GraphQL mutation
- Consider extracting to service object (`Services::Tickets::Exporter`) if CSV logic grows complex

### 8. Daily Email Reminder

- Set up `DailyTicketReminderJob` using ActiveJob
- Configure Solid Queue as ActiveJob adapter
- Job queries all open tickets directly
- Format email data in job or mailer
- Email agents with ticket list via ActionMailer
- Schedule via cron job or recurring job
- Email template: `app/views/ticket_mailer/daily_reminder.html.erb`
- Job logic: Query open tickets, group by assigned agent (if assigned), format for email template

### 9. Background Jobs with Solid Queue

- Configure ActiveJob to use Solid Queue adapter (`config.active_job.queue_adapter = :solid_queue`)
- **Single Database Approach**: Solid Queue uses the same PostgreSQL database as the application
  - Solid Queue creates its own tables (`solid_queue_jobs`, `solid_queue_claimed_executions`, etc.) in the same database
  - No separate Redis or external queue system needed
  - Simpler setup and deployment
- Run Solid Queue worker process (`bin/rails solid_queue:start`)
- Mount Mission Control in routes (`mount MissionControl::Engine => "/jobs"`)
- Daily email job runs at scheduled time (using `SolidQueue::RecurringTask` or cron)
- Monitor jobs via Mission Control web UI at `/jobs`
- Email template: `app/views/ticket_mailer/daily_reminder.html.erb`

## Frontend Implementation (React + Shoelace)

### 1. Project Setup

- Initialize React app with Vite or Create React App
- Install Shoelace components
- Set up React Router for navigation
- Configure Apollo Client for GraphQL
- Set up authentication context/store

### 2. Authentication Pages

**Login Page** (`src/pages/Login.tsx`)

- Email/password form using Shoelace inputs
- GraphQL mutation for sign-in
- Store JWT token in localStorage
- Redirect based on role (customer -> tickets list, agent -> dashboard)

**Sign Up Page** (`src/pages/SignUp.tsx`)

- Registration form (customers only)
- GraphQL mutation for sign-up
- Auto-login after registration

### 3. Customer Portal

**Customer Dashboard** (`src/pages/customer/Dashboard.tsx`)

- List of customer's tickets
- Filter by status
- Create new ticket button
- Shoelace card components for ticket display

**Create Ticket Page** (`src/pages/customer/CreateTicket.tsx`)

- Form: subject, description
- File upload component (images/PDFs)
- Shoelace file input with preview
- Submit via GraphQL mutation

**Ticket Detail Page** (`src/pages/customer/TicketDetail.tsx`)

- Display ticket info and status
- Comments thread (Shoelace card/list)
- Comment form (only if agent has commented)
- File attachments display
- Real-time updates (polling or subscriptions)

### 4. Agent Portal

**Agent Dashboard** (`src/pages/agent/Dashboard.tsx`)

- List all tickets
- Filter by status and assignment (assigned to me, unassigned, all)
- Search functionality
- Statistics cards (open, in progress, closed, assigned to me)
- Show assigned agent for each ticket
- Shoelace data table component

**Ticket Detail Page** (`src/pages/agent/TicketDetail.tsx`)

- Full ticket information
- Assignment section: show current assigned agent, dropdown to assign/reassign (includes "Assign to me" option)
- Comment thread
- Comment form (always available for agents)
- Status update dropdown
- Mark as closed button

**CSV Export** (`src/pages/agent/Export.tsx`)

- Button to trigger CSV export
- Download closed tickets from last month
- GraphQL query/mutation for export

### 5. Shared Components

**Comment Thread** (`src/components/CommentThread.tsx`)

- Display comments with user info
- Timestamp formatting
- Distinguish customer vs agent comments

**File Upload** (`src/components/FileUpload.tsx`)

- Shoelace file input
- Preview for images
- PDF icon display
- Multiple file support

**Ticket Card** (`src/components/TicketCard.tsx`)

- Reusable ticket display component
- Status badges (Shoelace badges)
- Display assigned agent if assigned

### 6. GraphQL Integration

- Apollo Client setup with auth headers
- Queries and mutations in `src/graphql/`
- Error handling
- Loading states
- Optimistic updates for comments

## Key Business Logic Implementation

Business logic implemented in models and GraphQL mutations:

### Comment Validation Rule

In `Comment` model custom validation:

- `validate_customer_can_comment` method
- Before creating comment, check if user is customer
- If customer, verify ticket has at least one agent comment using `ticket.has_agent_comment?`
- Add error to model if validation fails
- In GraphQL mutation, check model errors and return appropriate GraphQL error

### Ticket Status Updates

In GraphQL `updateTicketStatus` mutation:

- Validate agent permissions (check current_user.agent?)
- Validate status transitions (e.g., can't go from closed back to open without special handling)
- Update ticket status
- Return updated ticket or GraphQL error

### Ticket Assignment

In GraphQL `assignTicket` mutation:

- Validate that current user is an agent
- Validate that target agent exists and is an agent (if assigning to someone)
- Update ticket's assigned_agent_id
- Handle unassignment (set to null)
- Return updated ticket or GraphQL error

### Auto Status Update on Agent Comment

In `Comment` model callback:

- `after_create :update_ticket_status_if_agent`
- Check if comment user is an agent
- If agent and ticket status is 'open', update to 'in_progress'

## File Structure

```
tix-support/
├── backend/
│   ├── app/
│   │   ├── graphql/
│   │   │   ├── types/
│   │   │   ├── mutations/
│   │   │   └── queries/
│   │   ├── models/
│   │   ├── services/ (optional - only if needed for complex logic like CSV export)
│   │   └── jobs/
│   ├── config/
│   └── db/
│       └── migrate/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── graphql/
│   │   └── utils/
│   └── public/
└── README.md
```

## Environment Configuration

- Backend: `.env` for database, JWT secret, SMTP settings
- Frontend: `.env` for GraphQL endpoint URL
- Development vs production configurations

## Testing Considerations

- Backend: 
  - RSpec tests for models (validations, associations, scopes, custom validations, callbacks)
  - RSpec tests for GraphQL queries/mutations (integration tests covering business logic)
  - Test business rules in model specs and GraphQL mutation specs
- Frontend: Component tests (optional)
- Integration tests for critical flows (end-to-end)

## Deployment Notes

- Backend: Deploy to Heroku, Railway, or similar
- Frontend: Deploy to Vercel, Netlify, or static hosting
- Database: Managed PostgreSQL service
- File storage: Migrate to S3 for production
- Background jobs: Run Solid Queue worker process (`bin/rails solid_queue:start`) as separate process or via Procfile
- Mission Control: Accessible at `/jobs` route (protect with authentication in production)
