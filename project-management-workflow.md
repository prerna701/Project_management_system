# Project Management System Workflow

## 1. Roles and Access Control

The system begins with configurable roles:

- Admin
- CEO
- COO
- CIO
- CFO
- CHRO
- Manager
- Team Lead
- Developer
- User

Roles are not fixed. Admin can create additional roles anytime:

- QA Lead
- Designer
- Business Analyst
- Support Engineer
- …and more

> A role defines what a person is generally allowed to do in the system.

## 2. Permissions Model

Permissions are fine-grained actions that roll up into roles.

Example permissions:

- Create Project
- Edit Project
- View Tasks
- Assign Tasks
- Transfer Team Member
- Create Milestone

A role is a bundle of permissions.

Example:

- Role: Team Lead
- Permissions:
  - View Projects
  - View Team Members
  - Create Tasks
  - Assign Tasks
  - Update Task Status

### User-specific access

If two users share the same role, one user may still receive extra access.

Example:

- John and Sarah are both Developers
- Sarah also receives permission to edit project budget
- John keeps standard Developer access

> Final Access = Role Permissions + User-Specific Permissions

---

## 3. User Management and Verification

### User Creation

Admin creates a user and assigns a role from a dropdown.

Example:

- Name: John Doe
- Role: Developer

If the role does not exist, Admin can create it first and then assign it.

### Verification Flow

After user creation:

1. User is created in `Pending` state
2. Verification email is sent
3. User clicks the link
4. OTP is emailed
5. User submits OTP
6. Account becomes `Active`
7. User can log in

> New users cannot log in until OTP verification completes.

---

## 4. Team Management

### Team Creation

Admin or Project Manager can create a team.

Example:

- Team Name: Mobile App Team
- Department: Engineering
- Team Lead: Sarah
- Members: John, Mike, Priya

### Team Membership Details

When adding members, the system stores:

- Member identity
- Team responsibility
- Reporting manager

Example:

- John → Developer → reports to Sarah
- Mike → QA Engineer → reports to Sarah
- Sarah → Team Lead

> System Role controls access. Team Responsibility describes the role inside the team.

---

## 5. Project Management

### Project Creation

Project creation is done by Admin or authorized users such as Project Manager.

Example project fields:

- Project Name
- Client
- Assigned Team
- Project Manager
- Estimated Hours
- Priority
- Visibility
- Start Date / End Date
- Budget
- Billable / Non-Billable

### Project Priority Rules

Priority is derived from estimated hours:

- `Foundation`: up to 100 hours
- `Advanced`: 101–400 hours
- `Strategic`: 401–800 hours
  
Example:

- Estimated hours = 450 → Priority = `Strategic`

### Project Visibility

Two visibility types:

- `Public Project`
  - Any logged-in user can view
- `Private Project`
  - Only Admin, Project Manager, and assigned team members can view

Example:

- CRM System is private
- Visible to:
  - Admin
  - Assigned Project Manager
  - Mobile App Team members
- Not visible to unrelated teams

---

## 6. Work Planning and Tracking

### Milestones

Projects are divided into milestones:

- UI/UX Design
- Backend Development
- Testing
- Deployment

Milestones help track major phases and completion progress.

### Tasks

Milestones contain tasks.

Example task fields:

- Title
- Description
- Assignee
- Reporter
- Priority
- Status
- Start Date
- Due Date
- Estimated Hours
- Logged Hours
- Billable
- Dependencies
- Attachments
- Comments
- Labels

Task statuses:

- Open
- In Progress
- Review
- Testing
- Done
- Blocked

### Subtasks

Tasks can be broken into smaller subtasks:

Example for `Create Login API`:

- Create login form validation
- Create login API
- Add password encryption
- Test login flow

Subtasks make work easier to manage and track.

---

## 7. Team Member Transfer

### Transfer Workflow

If a user moves between teams, the system supports transfer with task reassignment.

Example:

- John moves from Mobile App Team to CRM Team

During transfer:

- Choose whether open tasks should be reassigned
- If yes, reassign John’s open tasks to another member (e.g., Mike)
- If no, John remains assignee while team membership changes

---

## 8. Access Rules: Who Can See What

### Admin

- Full access to everything

### Project Manager

- Can see and manage projects they own
- Can manage milestones and tasks if permitted

### Team Lead

- Can see assigned team projects
- Can assign and track team tasks if permitted

### Developer

- Can see projects assigned to their team
- Can work on assigned tasks

### Other logged-in users

- Can see public projects only
- Cannot access private projects unless part of the assigned team

---

## 9. Example Business Scenario

Example complete flow:

1. Admin creates users and roles
2. Users verify accounts via email OTP
3. Admin creates Mobile App Team
4. Admin adds Sarah, John, Mike, Priya
5. Project Manager creates CRM System project
6. Project is marked private
7. Mobile App Team is assigned
8. Project is divided into milestones
9. Team Lead creates tasks under milestones
10. Developers break tasks into subtasks
11. Team updates task status
12. Project Manager tracks progress
13. If a member transfers, tasks can be reassigned
14. Project completes successfully

---

## 10.  Summary

The system manages users, roles, teams, projects, milestones, tasks, and subtasks in one workflow. Access control ensures every person sees only the work they are allowed to handle.

## 11. Project Manager Summary

A Project Manager can create projects, assign teams, define milestones, create tasks/subtasks, track progress, and handle team member transfers with task reassignment.