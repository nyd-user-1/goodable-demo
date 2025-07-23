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