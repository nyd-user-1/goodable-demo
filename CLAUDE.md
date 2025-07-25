# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server (runs on port 8080)
npm run dev

# Build for production
npm run build

# Build for development environment
npm run build:dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Preview production build
npm run preview
```

## Project Architecture

This is a React 18 + TypeScript application built with Vite for legislative policy analysis and bill tracking. The project follows a feature-based component architecture:

### Core Stack
- **React 18** with TypeScript and strict type checking
- **Vite** for development and building
- **Tailwind CSS** with custom theme system and dark mode
- **shadcn/ui** component library with Radix UI primitives
- **Supabase** for authentication, database, and edge functions
- **React Query** for data fetching and caching
- **React Router** for navigation

### Project Structure

```
src/
├── components/
│   ├── features/          # Domain-specific components
│   │   ├── analysis/      # Bill analysis functionality
│   │   ├── bills/         # Legislative bill management
│   │   ├── chat/          # AI chat interface
│   │   ├── committees/    # Committee tracking
│   │   ├── dashboard/     # Main dashboard views
│   │   ├── members/       # Legislator profiles
│   │   └── problems/      # Problem-solving tools
│   ├── shared/            # Reusable cross-feature components
│   ├── ui/                # Base UI components (shadcn)
│   └── sidebar/           # Navigation components
├── contexts/              # React contexts (Auth, Model selection)
├── hooks/                 # Custom React hooks
├── integrations/supabase/ # Supabase client and types
├── pages/                 # Route components
├── types/                 # TypeScript definitions
└── utils/                 # Utility functions
```

### Key Features
- **Authentication**: Secure user management via Supabase Auth
- **Multi-model AI**: Support for various OpenAI models with context switching
- **Legislative Data**: Bill tracking, member profiles, committee management
- **Real-time Chat**: AI-powered legislative analysis and drafting
- **Policy Drafting**: Collaborative document creation tools
- **Responsive Design**: Mobile-first with sidebar navigation

### State Management
- **React Query** for server state and caching
- **React Context** for global app state (auth, model selection)
- **Local component state** for UI-specific data

### Routing Structure
- `/` - Landing page (public)
- `/auth` - Authentication (public)
- `/problems/:problemSlug` - Public problem pages
- Protected routes (require authentication):
  - `/dashboard` - Main dashboard
  - `/bills` - Legislative bills
  - `/members` - Legislator directory
  - `/committees` - Committee tracking
  - `/chats` - Chat history
  - `/favorites` - Saved items
  - `/policy-portal` - Policy drafting
  - `/playground` - AI playground
  - `/profile` - User profile
  - `/plans` - Subscription plans

### Configuration Notes

#### TypeScript
- Strict configuration with `noUnusedLocals` and `noImplicitReturns`
- Path aliases: `@/*` maps to `./src/*`
- Strict null checks and function types enabled

#### ESLint
- No console statements allowed in production (except `warn` and `error`)
- Unused variable detection with underscore prefix exception
- React hooks rules enforced

#### Supabase Integration
- Edge functions in `/supabase/functions/` for AI processing
- Database migrations in `/supabase/migrations/`
- Real-time subscriptions for live data updates

### Development Guidelines
- Use feature-based organization for domain components
- Leverage shared components for common UI patterns
- Follow existing TypeScript strict typing patterns
- Use React Query for all server state management
- Implement proper error boundaries and loading states

## Design Philosophy & Visual Standards

### Recent Success - Radix Design System Implementation
The platform recently underwent an exceptional UI/UX redesign using Radix design principles. This work represents the quality standard for all future design decisions.

### Color Palette (Custom Radix)
- **Accent**: #3D63DD (professional blue)
- **Gray**: #8B8D98 (muted gray)
- **Background**: #FFFFFF (light) / Dark theme backgrounds
- **Priority Colors**: High (red), Normal (blue), Low (green), Urgent (orange)

### Design Excellence Examples
The current implementation demonstrates outstanding design work:
- Clean changelog with accordion functionality
- Professional subscription plans layout
- Excellent bills/legislation browsing interface
- Committee management with proper card layouts
- **Perfect light/dark mode implementations** (both modes work beautifully)
- Subtle animations and micro-interactions

### Design Standards
- Prioritize clean, professional interfaces over flashy effects
- Maintain Radix design system consistency
- Always ensure both light AND dark modes work perfectly
- Use subtle animations and proper visual hierarchy
- Professional typography and spacing
- Accessible color contrasts and interactions

### UI/UX Quality Bar
The recent Radix redesign work was exceptional - maintain this level of design quality in all future changes.

### Component Libraries & Resources

#### Primary Design System
- **shadcn/ui**: Built on Radix UI primitives with Tailwind styling
- **Radix UI**: Core accessible primitives and design tokens

#### Secondary Component Resources
- **ReactBits.dev**: Excellent dark mode components and advanced UI patterns
  - Use for complex dark mode implementations
  - High-quality component examples and patterns
- **MagicUI.design**: Modern component library with beautiful animations
  - Leverage for enhanced UI components and micro-interactions
  - Expect frequent integration of components from this source

#### Component Integration Workflow
- Components from ReactBits and MagicUI may be dropped in for replication/adaptation
- Maintain design system consistency when integrating external components
- Adapt component styling to match our Radix/shadcn design tokens

### Development Standards

#### Animation Philosophy
- **Subtle, unexpected, joyful, dopamine-driven interactions**
- Micro-animations that delight without overwhelming
- Performance-first: animations should enhance, not hinder

#### Performance Priority
- **Performance first, always**
- Prioritize performance over complex animations
- Optimize for fast load times and smooth interactions

#### Accessibility Standards
- Maintain Radix UI's accessibility-first approach
- Proper ARIA labels, keyboard navigation, and screen reader support
- Color contrast compliance and focus management

#### Mobile-First Development
- **PIXEL PERFECT ON MOBILE OR IT'S NOT DONE**
- Mobile-first responsive design approach
- Test thoroughly on mobile devices before desktop
- Touch-friendly interactions and proper spacing

#### Browser Support
- Modern browser support (Chrome, Firefox, Safari, Edge)
- Progressive enhancement for older browsers
- Cross-browser testing for critical functionality

## Database Schema

This section documents the complete Supabase database schema as the source of truth for all database operations.

### Core Legislative Tables

#### Bills
- **bill_id** (bigint, PK): Unique identifier
- **session_id** (bigint): Legislative session reference
- **bill_number** (text): Official bill number
- **status** (bigint): Current status code
- **status_desc** (text): Human-readable status
- **title** (text): Bill title
- **description** (text): Full description
- **committee_id** (text): Assigned committee
- **committee** (text): Committee name
- **url** (text): External URL
- **state_link** (text): State website link

#### People (Legislators)
- **people_id** (bigint, PK): Unique identifier
- **name** (text): Full name
- **first_name**, **middle_name**, **last_name**, **suffix** (text)
- **party** (text): Political party
- **role** (text): Current role
- **district** (text): District representation
- **chamber** (text): House/Senate
- **bio_long**, **bio_short** (text): Biographical information
- **photo_url** (text): Profile photo
- **email**, **phone_capitol**, **phone_district** (text): Contact info
- **archived** (boolean): Archive status

#### Committees
- **committee_id** (bigint, PK): Unique identifier
- **committee_name** (text): Official name
- **slug** (text): URL-friendly name
- **chamber** (text): House/Senate
- **description** (text): Committee purpose
- **chair_name** (text): Committee chair
- **member_count** (text): Number of members
- **active_bills_count** (text): Active bills count

### Blog/Policy System

#### blog_proposals
- **id** (uuid, PK): Unique identifier
- **title** (text, NOT NULL): Proposal title
- **content** (text, NOT NULL): Full content
- **summary** (text): Brief summary
- **author_id** (uuid, NOT NULL, FK → auth.users): Author reference
- **status** (text): draft/published/archived
- **category** (text): Content category
- **tags** (ARRAY): Tag array
- **published_at** (timestamptz): Publication date
- **view_count** (integer): View counter
- **is_featured** (boolean): Featured flag

#### blog_comments
- **id** (uuid, PK): Unique identifier
- **proposal_id** (uuid, NOT NULL, FK → blog_proposals): Parent proposal
- **author_id** (uuid, NOT NULL, FK → auth.users): Comment author
- **content** (text, NOT NULL): Comment content
- **parent_comment_id** (uuid, FK → blog_comments): For nested comments
- **is_edited** (boolean): Edit status
- **edited_at** (timestamptz): Last edit time

#### blog_votes
- **id** (uuid, PK): Unique identifier
- **proposal_id** (uuid, NOT NULL, FK → blog_proposals): Target proposal
- **voter_id** (uuid, NOT NULL, FK → auth.users): Voter
- **vote_type** (text): upvote/downvote

### User System

#### profiles
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, UNIQUE, FK → auth.users): Auth user
- **username** (text, UNIQUE): Display username
- **display_name** (text): Full display name
- **avatar_url** (text): Profile image
- **bio** (text): User biography
- **role** (text): User role (default: 'user')

#### subscribers
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, FK → auth.users): User reference
- **email** (text, NOT NULL, UNIQUE): Email address
- **stripe_customer_id** (text): Stripe reference
- **subscription_tier** (text): free/student/staffer/researcher/professional/enterprise/government
- **subscription_end** (timestamptz): Subscription expiry

### Policy Development System

#### problem_statements
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → profiles): Creator
- **title** (text, NOT NULL): Problem title
- **description** (text, NOT NULL): Full description
- **category** (text): Problem category
- **priority** (text): Priority level
- **status** (text): Current status

#### legislative_ideas
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → profiles): Creator
- **problem_statement_id** (uuid, FK → problem_statements): Related problem
- **title** (text, NOT NULL): Idea title
- **original_idea** (text, NOT NULL): Initial concept
- **improved_idea** (text): Refined version
- **category** (text): Idea category
- **status** (text): Current status

#### legislative_drafts
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → profiles): Primary author
- **legislative_idea_id** (uuid, FK → legislative_ideas): Source idea
- **title** (text, NOT NULL): Draft title
- **type** (text): Draft type
- **draft_content** (text, NOT NULL): Full content
- **analysis** (jsonb): AI analysis data
- **votes** (jsonb): Voting data
- **is_public** (boolean): Public visibility
- **status** (text): Draft status
- **co_author_count** (integer): Number of co-authors

#### co_authors
- **id** (uuid, PK): Unique identifier
- **legislative_draft_id** (uuid, NOT NULL, FK → legislative_drafts): Target draft
- **user_id** (uuid, NOT NULL, FK → auth.users): Co-author
- **invited_by** (uuid, NOT NULL, FK → auth.users): Inviter
- **role** (text): Collaboration role
- **status** (text): Invitation status
- **accepted_at** (timestamptz): Acceptance timestamp

### Chat & AI System

#### chat_sessions
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → auth.users): Session owner
- **bill_id** (bigint, FK → Bills): Related bill
- **member_id** (bigint, FK → People): Related member
- **committee_id** (bigint, FK → Committees): Related committee
- **title** (text, NOT NULL): Session title
- **messages** (jsonb): Chat messages array

#### problem_chats
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → auth.users): Chat owner
- **problem_number** (text, NOT NULL, UNIQUE): Problem identifier
- **title** (text, NOT NULL): Problem title
- **problem_statement** (text, NOT NULL): Full statement
- **current_state** (text): Workflow state
- **chat_session_id** (uuid, FK → chat_sessions): Related chat

### Favorites System

#### user_favorites
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → auth.users): User
- **bill_id** (bigint, NOT NULL): Favorited bill

#### user_member_favorites
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → auth.users): User
- **member_id** (bigint, NOT NULL, FK → People): Favorited member

#### user_committee_favorites
- **id** (uuid, PK): Unique identifier
- **user_id** (uuid, NOT NULL, FK → auth.users): User
- **committee_id** (bigint, NOT NULL, FK → Committees): Favorited committee

### Views

#### blog_proposal_stats (Materialized View)
Aggregates blog proposal data with vote counts and author information for performance optimization.

### Key Relationships
1. All user-generated content links to **auth.users** via foreign keys
2. **profiles** table extends auth.users with application-specific data
3. Blog system (proposals, comments, votes) forms a complete content management system
4. Legislative data (Bills, People, Committees) imported from external sources
5. Policy development flows from problem_statements → legislative_ideas → legislative_drafts
6. Co-authoring system enables collaborative drafting
7. Favorites system allows users to track bills, members, and committees

### Row Level Security (RLS)
- All user tables have RLS enabled
- Public read access for published content
- User-specific write access for personal data
- Authenticated access required for creating content

### Important Notes
- Use `auth.uid()` for current user identification in RLS policies
- Join with `profiles` table for user display information
- The `update_updated_at_column()` trigger function already exists in the database
- Blog system is complete and production-ready as confirmed by Lovable