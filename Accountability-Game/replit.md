# Anchors - Habit Tracker & Accountability Platform

A mobile-first, multi-user habit tracker (called "Anchors") with accountability buddies feature. Built for calm productivity with a modern aesthetic.

## Features

### Core Tracking
- **Today View**: Completion ring, anchor quick toggles, anchor status sheet with seen/reactions
- **Monthly Habits**: Grid view with days 1-31, daily completion percentages
- **Analytics**: Completion trends, anchor performance, insights

### Multi-User & Buddies
- **User Accounts**: Register, login, profile management
- **Buddy System**: Connect with accountability partners
- **Acknowledgements**: "Seen" and "Approve" daily check-ins
- **AnchorSeen**: Track when buddies have seen specific anchor completions
- **Watching**: Watch specific anchors to get notified of completions
- **Reactions**: React to buddy's anchor completions (like, love, celebrate, support, fire)
- **Privacy Controls**: Choose what buddies can see

### Follow System
- **Public Profiles**: Opt-in to make profile discoverable
- **Follow/Unfollow**: Follow public profiles (separate from buddy system)
- **Privacy Controls**: Control visibility of follower/following lists

### Projects
- **Shared Goals**: Create projects with team goals
- **Public Projects**: Optionally allow public join for discoverable projects
- **Progress Tracking**: Link anchors to contribute to project goals

### Other Features
- Dark/Light mode toggle
- Mobile-first responsive design with bottom tab navigation
- Seed anchors on account creation
- PostgreSQL database persistence
- Onboarding wizard

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + Passport.js (sessions)
- **Database**: PostgreSQL with Drizzle ORM
- **Charts**: Recharts
- **Routing**: wouter

## Terminology

The app uses "Anchors" terminology in the UI while internally the code uses "habits" for database tables and variables.

## How to Run

```bash
npm run dev
```

The app runs on port 5000.

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string (auto-provisioned by Replit)
- `SESSION_SECRET` - Session encryption secret

## Database Schema

### Tables
- **users** - User accounts (id, username, password, displayName, timezone, isPublic, bio, avatarUrl)
- **habits** - Anchor definitions (id, userId, name, emoji, targetPerWeek, isActive)
- **habit_logs** - Daily anchor completion (userId, habitId, dateISO, done)
- **tasks** - Daily tasks (deprecated, table kept for potential future use)
- **buddy_connections** - User connections (requesterId, receiverId, status)
- **visibility_settings** - Privacy controls (shareHabits, shareHabitStatus, showFollowerList, showFollowingList)
- **acknowledgements** - Daily buddy check-ins (subjectUserId, buddyUserId, dateISO, type)
- **anchor_seen** - Tracks when buddies see anchor completions (habitLogId, buddyUserId)
- **habit_watchers** - Buddies watching specific anchors
- **habit_reactions** - Buddy reactions to anchor completions
- **follows** - Follow relationships between public profiles
- **projects** - Shared goal projects (visibility, allowPublicJoin)
- **project_members** - Project membership
- **project_habit_links** - Links anchors to projects

### Migrations

```bash
npm run db:push
```

## API Endpoints

### Auth
- `POST /api/register` - Create account
- `POST /api/login` - Sign in
- `POST /api/logout` - Sign out
- `GET /api/user` - Get current user

### Anchors & Logs
- `GET /api/habits` - List user's anchors
- `POST /api/habits` - Create anchor
- `PATCH /api/habits/:id` - Update anchor
- `DELETE /api/habits/:id` - Delete anchor
- `GET /api/habit-logs` - Get anchor completion logs
- `POST /api/habit-logs/toggle` - Toggle anchor for date

### AnchorSeen
- `GET /api/anchor-logs/:logId/seen` - Get who has seen an anchor log
- `POST /api/anchor-logs/:logId/seen` - Mark anchor log as seen
- `DELETE /api/anchor-logs/:logId/seen` - Remove seen mark

### Buddies
- `GET /api/buddies` - List connected buddies
- `GET /api/buddies/pending` - List pending requests
- `POST /api/buddies/invite` - Send connection request
- `POST /api/buddies/:id/accept` - Accept request
- `POST /api/buddies/:id/decline` - Decline request
- `GET /api/buddies/:userId/overview` - View buddy's shared data
- `GET /api/buddies/:userId/anchors-seen` - Get anchor seen records for buddy's logs

### Follow System
- `POST /api/users/:username/follow` - Follow a public user
- `DELETE /api/users/:username/follow` - Unfollow a user
- `GET /api/users/:id/followers` - Get user's followers
- `GET /api/users/:id/following` - Get who user is following
- `GET /api/users/:id/public-profile` - Get public profile with follow counts

### Projects
- `GET /api/projects` - List user's projects
- `GET /api/projects/public` - Discover public projects
- `POST /api/projects` - Create project
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/join` - Join public project
- `POST /api/projects/:id/leave` - Leave project
- `POST /api/projects/:id/invite` - Invite/add members (supports mode: "invite" or "direct", multiple userIds)
- `GET /api/projects/:id/members` - List project members with user details
- `DELETE /api/projects/:id/members/:userId` - Remove member (owner or self)

### Chatrooms
- `GET /api/chatrooms` - List user's chatrooms
- `POST /api/chatrooms` - Create chatroom
- `GET /api/chatrooms/:id/messages` - Get chatroom messages
- `POST /api/chatrooms/:id/messages` - Send message
- `POST /api/chatrooms/:id/members` - Add members (admin only, generates system messages)
- `DELETE /api/chatrooms/:id/members/:userId` - Remove member (admin only)

### Profile & Privacy
- `PATCH /api/profile` - Update display name, timezone
- `GET /api/visibility` - Get privacy settings
- `PATCH /api/visibility` - Update privacy settings

## Project Structure

```
client/
  src/
    components/        - UI components (RingChart, HabitIcon, AnchorStatusSheet, etc.)
    hooks/             - use-auth, use-toast
    lib/               - queryClient, protected-route, dateUtils, useTheme, onboarding-steps
    pages/             - TodayPage, MonthlyHabits, BuddiesPage, AnalyticsPage, ProfilePage, DiscoverPage, ProjectsPage
    App.tsx            - Main app with routing and bottom nav
server/
  auth.ts              - Passport.js authentication setup
  db.ts                - Drizzle database connection
  routes.ts            - API endpoints
  storage.ts           - Database CRUD operations
shared/
  schema.ts            - Drizzle schema and types
```

## Default Seed Anchors

On account creation, users get these anchors:
1. Wake up early
2. Gym
3. Reading
4. Budget tracking
5. Project work
6. Social media detox
7. Goal journaling
8. Cold shower

## Privacy Settings

Users can control what buddies see:
- **Share Habits**: Show anchor names
- **Share Habit Status**: Show completion status
- **Show Follower List**: Allow others to see followers
- **Show Following List**: Allow others to see who you follow
