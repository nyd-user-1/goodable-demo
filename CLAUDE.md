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