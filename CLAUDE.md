# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run typecheck    # Type checking (tsc --noEmit)
npm run lint         # ESLint
npm run preview      # Preview production build
```

## Stack

React 18 + TypeScript + Vite. Tailwind CSS with shadcn/ui (Radix primitives). Supabase for auth, database, and edge functions. React Query for data fetching. React Router for navigation. Deployed on Vercel.

## Project Structure

```
src/
├── components/
│   ├── features/
│   │   ├── bills/         # Bill cards, grids, filters, detail views
│   │   ├── committees/    # Committee cards, tables, detail views
│   │   ├── dashboard/     # Dashboard tables (bills, members, committees)
│   │   ├── feed/          # Legislative feed, search, document upload
│   │   ├── home/          # Welcome message
│   │   └── members/       # Member cards, tables, detail views
│   ├── ai-elements/       # Inline citations, AI UI components
│   ├── blocks/            # Layout blocks
│   ├── magicui/           # MagicUI animated components
│   ├── marketing/         # Marketing page components
│   ├── shared/            # Cross-feature reusable components
│   └── ui/                # shadcn/ui base components
├── contexts/              # AuthContext, ModelContext
├── hooks/                 # ~38 custom hooks
├── integrations/supabase/ # Supabase client and generated types
├── pages/                 # 47 route page components
├── types/                 # TypeScript definitions
└── utils/                 # adminHelpers, analytics, billNumberUtils, citationParser, committeeSlug, dateUtils, markdownUtils, memberSlug
```

## Routes (src/App.tsx)

All pages are lazy-loaded. The root `/` renders `NewChat`.

### Public Routes
| Path | Page | Purpose |
|------|------|---------|
| `/` | NewChat | Main chat interface (landing page) |
| `/auth` | Auth | Login/signup |
| `/auth-4` | Auth4 | Alternate auth page |
| `/about` | About | About page |
| `/features` | Features | Feature showcase |
| `/history` | History | Platform history |
| `/academy` | Academy | Learning resources |
| `/ai-fluency` | AIFluency | AI literacy content |
| `/constitution` | Constitution | NY Constitution reference |
| `/digital-bill-of-rights` | DigitalBillOfRights | Digital rights reference |
| `/live-feed` | LiveFeed | Public legislative feed |
| `/new-prompts` | PromptHub | Prompt library |
| `/use-cases` | UseCases | Use case overview |
| `/use-cases/bills` | UseCasesBills | Bills use case |
| `/use-cases/committees` | UseCasesCommittees | Committees use case |
| `/use-cases/members` | UseCasesMembers | Members use case |
| `/use-cases/policy` | UseCasesPolicy | Policy use case |
| `/use-cases/departments` | UseCasesDepartments | Departments use case |
| `/nonprofits` | Nonprofits | Nonprofit overview |
| `/nonprofits/economic-advocacy` | NonprofitEconomicAdvocacy | Economic advocacy |
| `/nonprofits/environmental-advocacy` | NonprofitEnvironmentalAdvocacy | Environmental advocacy |
| `/nonprofits/legal-advocacy` | NonprofitLegalAdvocacy | Legal advocacy |
| `/nonprofits/social-advocacy` | NonprofitSocialAdvocacy | Social advocacy |
| `/nonprofits/directory` | NonprofitDirectory | Nonprofit directory |

### Protected Routes (require auth)
| Path | Page | Purpose |
|------|------|---------|
| `/new-chat` | NewChat | Start new chat |
| `/c/:sessionId` | NewChat | Resume chat session |
| `/bills` | Bills2 | Bills listing |
| `/bills/:billNumber` | Bills | Bill detail |
| `/committees` | Committees2 | Committees listing |
| `/committees/:committeeSlug` | Committees | Committee detail |
| `/members` | Members2 | Members listing |
| `/members/:memberSlug` | Members | Member detail |
| `/contracts` | Contracts | State contracts listing |
| `/contracts/:contractNumber` | ContractDetail | Contract detail |
| `/lobbying` | Lobbying | Lobbying data listing |
| `/lobbying/:id` | LobbyingDetail | Lobbying detail |
| `/school-funding` | SchoolFunding | School funding listing |
| `/school-funding/:fundingId` | SchoolFundingDetail | School funding detail |
| `/budget` | Budget | Budget overview |
| `/budget-dashboard` | BudgetDashboard | Budget visualizations |
| `/departments` | Prompts | Departments listing |
| `/departments/:slug` | DepartmentDetail | Department detail |
| `/chats` | Chats2 | Chat history |
| `/plans` | Plans | Subscription plans |
| `/profile` | Profile | User profile/settings |
| `/new-note` | NewNote | Create note |
| `/n/:noteId` | NoteView | View/edit note |
| `/e/:excerptId` | ExcerptView | View excerpt |
| `/feed` | FeedPage | Activity feed |

## Key Patterns

**Authentication**: Supabase Auth via `AuthContext`. Protected routes use `<ProtectedRoute>` wrapper. Admin check via `isAdmin()` in `utils/adminHelpers.ts` (single admin: brendan.stanton@gmail.com).

**Data fetching**: React Query (`@tanstack/react-query`) for all server state. Supabase client at `integrations/supabase/client.ts`. Generated types at `integrations/supabase/types.ts`.

**AI chat**: Main chat is `NewChat.tsx` (the `/ ` route). Uses Supabase edge function `generate-with-openai`. Chat sessions persisted to `chat_sessions` table. Chat logic in `hooks/useChatLogic.tsx` and `hooks/useChatPersistence.ts`.

**Notes system**: `NoteView.tsx` uses TipTap editor. Notes persisted via `hooks/useNotePersistence.ts`. Excerpts via `hooks/useExcerptPersistence.ts`.

**Navigation**: `ChatHeader.tsx` (glass morphism fixed nav) + `NoteViewSidebar.tsx` (slide-out sidebar with chat history, notes, and settings). `SearchModal.tsx` for global search (Ctrl+K).

**Listing → Detail pattern**: Most data pages follow a listing/detail pattern with "v2" listing pages (`Bills2`, `Members2`, `Committees2`) and original detail pages (`Bills`, `Members`, `Committees`). Listings use slug-based routing to detail views.

## TypeScript

Strict mode with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`. Path alias `@/*` maps to `./src/*`. Always run `npm run typecheck` after changes.

## Design Standards

- Radix design system with accent color `#3D63DD`
- shadcn/ui components with Tailwind
- Light mode primary, dark mode supported
- Mobile-first — changes must work on mobile
- Glass morphism header: `bg-background/80 backdrop-blur-md`
- Subtle animations, performance first
- No GPT Engineer scripts in production builds

## Build Optimization

Vite `manualChunks` splits `vendor` (React) and `ui` (Radix) into preloaded chunks. Heavy libraries (TipTap, Recharts) are NOT in manualChunks — they bundle into their lazy-loaded page chunks to keep initial load small (~195 KB gzip).
