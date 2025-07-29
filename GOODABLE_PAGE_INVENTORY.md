# Goodable Platform - Complete Page Inventory and User Flow Documentation

## Table of Contents
1. [Page Inventory](#page-inventory)
2. [User Flow Mapping](#user-flow-mapping)
3. [Page Relationships](#page-relationships)
4. [Component Hierarchy](#component-hierarchy)
5. [State Management Flow](#state-management-flow)
6. [Visual Sitemap](#visual-sitemap)

---

## Page Inventory

### Public Pages (No Authentication Required)

#### 1. Landing Page (Primary)
- **Route**: `/` 
- **File**: `src/pages/Landing-2.tsx`
- **Purpose**: Main landing page with hero form, feature showcase, and waitlist signup
- **Key Components**: Hero form, feature sections, testimonials, pricing plans, FAQ
- **Data Dependencies**: Supabase (waitlist signup), sample problems
- **Auth Requirements**: None (public)
- **Special Features**: Analytics demo video, problem chat integration

#### 2. Alternative Landing Page
- **Route**: `/alt`
- **File**: `src/pages/Landing.tsx`
- **Purpose**: Alternative landing page design
- **Key Components**: Different hero layout, blog carousel
- **Data Dependencies**: Sample problems, visitor count
- **Auth Requirements**: None (public)

#### 3. Authentication Pages
- **Route**: `/auth`
- **File**: `src/pages/Auth.tsx`
- **Purpose**: User login/signup interface
- **Key Components**: Auth forms, social login options
- **Data Dependencies**: Supabase Auth
- **Auth Requirements**: None (public, for login)

- **Route**: `/auth-2`
- **File**: `src/pages/Auth2.tsx`
- **Purpose**: Alternative authentication interface
- **Key Components**: Different auth form design
- **Data Dependencies**: Supabase Auth
- **Auth Requirements**: None (public, for login)

#### 4. Public Problem Pages
- **Route**: `/problems/:problemSlug`
- **File**: `src/pages/ProblemPage.tsx`
- **Purpose**: Individual problem detail pages (accessible without auth)
- **Key Components**: Problem details, collaboration stream, related problems
- **Data Dependencies**: Static problem data, voting system
- **Auth Requirements**: None (public)
- **Special Features**: SEO metadata, social sharing

### Protected Pages (Authentication Required)

#### 5. Dashboard/Intelligence
- **Route**: `/dashboard`
- **File**: `src/pages/Index.tsx` → `@/components/Dashboard`
- **Purpose**: Main dashboard with intelligence and analytics
- **Key Components**: Dashboard widgets, charts, metrics
- **Data Dependencies**: User-specific data, analytics
- **Auth Requirements**: Must be logged in
- **Special Features**: Real-time data updates

#### 6. Home Page
- **Route**: `/home`
- **File**: `src/pages/Home.tsx`
- **Purpose**: User home page with personalized content
- **Key Components**: User feed, quick actions, navigation
- **Data Dependencies**: User profile, personalized content
- **Auth Requirements**: Must be logged in

#### 7. Alternative Home
- **Route**: `/home-2`
- **File**: `src/pages/Home-2.tsx`
- **Purpose**: Alternative home page design
- **Key Components**: Different layout approach
- **Data Dependencies**: User data
- **Auth Requirements**: Must be logged in

### Core Legislative Pages

#### 8. Bills Management
- **Route**: `/bills`
- **File**: `src/pages/Bills.tsx`
- **Purpose**: Browse and manage legislative bills
- **Key Components**: BillsGrid, BillsSearchFilters, BillDetail
- **Data Dependencies**: Supabase Bills table, committees, sponsors
- **Auth Requirements**: Must be logged in
- **Special Features**: Advanced filtering, bill detail modal

#### 9. Members Directory
- **Route**: `/members`
- **File**: `src/pages/Members.tsx`
- **Purpose**: Browse legislators and representatives
- **Key Components**: Member cards, search/filter, member profiles
- **Data Dependencies**: Supabase People table
- **Auth Requirements**: Must be logged in
- **Special Features**: Party/chamber filtering, contact information

#### 10. Committees
- **Route**: `/committees`
- **File**: `src/pages/Committees.tsx`
- **Purpose**: Committee information and management
- **Key Components**: Committee cards, member lists, bill assignments
- **Data Dependencies**: Supabase Committees table
- **Auth Requirements**: Must be logged in
- **Special Features**: Active bills count, member management

### Workflow Pages

#### 11. Problems/Challenges
- **Route**: `/problems`
- **File**: `src/pages/Problems.tsx`
- **Purpose**: Browse and manage civic challenges
- **Key Components**: Problem grid, categories, voting system
- **Data Dependencies**: Static problems data, user votes
- **Auth Requirements**: Must be logged in
- **Special Features**: Category filtering, voting integration

#### 12. Public Policy Solutions
- **Route**: `/public-policy`
- **File**: `src/pages/PublicPolicy.tsx`
- **Purpose**: Policy development and collaboration
- **Key Components**: Policy editor, collaboration tools
- **Data Dependencies**: User policies, collaboration data
- **Auth Requirements**: Must be logged in
- **Special Features**: Real-time collaboration

#### 13. Chat Sessions
- **Route**: `/chats`
- **File**: `src/pages/Chats.tsx`
- **Purpose**: AI-powered chat sessions for policy analysis
- **Key Components**: ChatSessionCard, ConversationView, MessageBubble
- **Data Dependencies**: Supabase chat_sessions table
- **Auth Requirements**: Must be logged in
- **Special Features**: AI integration, session management

#### 14. Favorites
- **Route**: `/favorites`
- **File**: `src/pages/Favorites.tsx`
- **Purpose**: User's saved/favorited items
- **Key Components**: Favorited bills, members, committees
- **Data Dependencies**: Supabase favorites tables
- **Auth Requirements**: Must be logged in
- **Special Features**: Multi-type favorites (bills, members, committees)

#### 15. AI Playground
- **Route**: `/playground`
- **File**: `src/pages/Playground.tsx`
- **Purpose**: AI experimentation and testing
- **Key Components**: AI interface, model selection, testing tools
- **Data Dependencies**: AI models, user sessions
- **Auth Requirements**: Admin only
- **Special Features**: Model switching, advanced AI features

#### 16. Policy Portal
- **Route**: `/policy-portal`
- **File**: `src/pages/PolicyPortal.tsx`
- **Purpose**: Bills and resolutions management
- **Key Components**: Policy creation tools, drafting interface
- **Data Dependencies**: Legislative drafts, co-authoring system
- **Auth Requirements**: Admin only
- **Special Features**: Collaborative drafting, version control

### Content & Information Pages

#### 17. Blog
- **Route**: `/blog`
- **File**: `src/pages/Blog.tsx`
- **Purpose**: Platform blog and articles
- **Key Components**: Blog post grid, categories, search
- **Data Dependencies**: Blog posts (static or database)
- **Auth Requirements**: Must be logged in
- **Special Features**: Article categories, search functionality

#### 18. Blog Posts
- **Route**: `/blog/:id`
- **File**: `src/pages/BlogPost.tsx`
- **Purpose**: Individual blog post pages
- **Key Components**: Article content, comments, sharing
- **Data Dependencies**: Blog post content, user comments
- **Auth Requirements**: Must be logged in
- **Special Features**: Comment system, social sharing

#### 19. Feed Page
- **Route**: `/feed`
- **File**: `src/pages/FeedPage.tsx`
- **Purpose**: Activity feed and updates
- **Key Components**: Feed items, filtering, real-time updates
- **Data Dependencies**: User activity, system updates
- **Auth Requirements**: Admin only
- **Special Features**: Real-time feed updates

### User Management Pages

#### 20. User Profile
- **Route**: `/profile`
- **File**: `src/pages/Profile.tsx`
- **Purpose**: User profile management and settings
- **Key Components**: Profile form, settings, preferences
- **Data Dependencies**: User profile data, subscription info
- **Auth Requirements**: Must be logged in
- **Special Features**: Profile editing, subscription management

#### 21. Subscription Plans
- **Route**: `/plans`
- **File**: `src/pages/Plans.tsx`
- **Purpose**: Subscription plan selection and management
- **Key Components**: Plan cards, pricing, upgrade/downgrade
- **Data Dependencies**: Subscription tiers, user subscription status
- **Auth Requirements**: Must be logged in
- **Special Features**: Stripe integration, plan comparison

### Utility & Information Pages

#### 22. Change Log
- **Route**: `/changelog`
- **File**: `src/pages/ChangeLog.tsx`
- **Purpose**: Platform updates and version history
- **Key Components**: Changelog entries, version timeline
- **Data Dependencies**: Version history data
- **Auth Requirements**: Must be logged in
- **Special Features**: Accordion-style changelog, version categorization

#### 23. About Page
- **Route**: `/about`
- **File**: `src/pages/About.tsx`
- **Purpose**: Platform information and team details
- **Key Components**: About content, team profiles, mission
- **Data Dependencies**: Static content
- **Auth Requirements**: Must be logged in
- **Special Features**: Team information, platform mission

### Admin & Development Pages

#### 24. Admin Control Panel
- **Route**: `/admin`
- **File**: `src/pages/Admin.tsx`
- **Purpose**: Administrative controls and system management
- **Key Components**: User management, system stats, admin tools
- **Data Dependencies**: System data, user analytics
- **Auth Requirements**: Admin only
- **Special Features**: User access control, system monitoring

#### 25. Design System/Style Guide
- **Route**: `/style-guide`
- **File**: `src/pages/StyleGuide.tsx`
- **Purpose**: UI component library and design system
- **Key Components**: Component examples, design tokens, usage guidelines
- **Data Dependencies**: None (static examples)
- **Auth Requirements**: Admin only
- **Special Features**: Interactive component demos

#### 26. Image System
- **Route**: `/image-system`
- **File**: `src/pages/ImageSystem.tsx`
- **Purpose**: Asset management and image library
- **Key Components**: ImageUploadArea, ImagePreviewDialog, ImageFilters
- **Data Dependencies**: Supabase assets table, storage bucket
- **Auth Requirements**: Admin only
- **Special Features**: Upload system, metadata management, filtering

#### 27. ShadCN Showcase
- **Route**: `/shadcn-showcase`
- **File**: `src/pages/ShadcnShowcase.tsx`
- **Purpose**: ShadCN UI component demonstrations
- **Key Components**: Various ShadCN components
- **Data Dependencies**: None (static examples)
- **Auth Requirements**: Admin only
- **Special Features**: Component library showcase

### Test & Development Pages

#### 28. Image Upload Test
- **Route**: `/image-upload-test`
- **File**: `src/pages/ImageUploadTest.tsx`
- **Purpose**: Testing image upload functionality
- **Key Components**: Upload testing interface
- **Data Dependencies**: File upload system
- **Auth Requirements**: Admin only
- **Special Features**: Upload testing, debug interface

#### 29. Test Sticky Headers
- **Route**: Not routed (development file)
- **File**: `src/pages/TestStickyHeaders.tsx`
- **Purpose**: Testing sticky header implementations
- **Key Components**: Header test components
- **Data Dependencies**: None
- **Auth Requirements**: N/A
- **Special Features**: Header behavior testing

---

## User Flow Mapping

### Primary User Journeys

#### 1. New Visitor Journey
```
Landing Page (/) 
  → Problem Interest → /problems/:slug (public)
  → Sign Up Interest → /auth
  → Learn More → FAQ/Features (same page)
  → Waitlist Signup → Success message
```

#### 2. Authentication Flow
```
/auth 
  → Successful Login → /home (if allowed user)
  → Successful Login → / (if not allowed user, redirect with waitlist scroll)
  → Registration → /home (if approved)
```

#### 3. Authenticated User Primary Flow
```
/home 
  → Dashboard → /dashboard
  → Legislative Research → /bills → BillDetail modal
  → Member Research → /members → Member profiles
  → Committee Research → /committees
  → Problem Solving → /problems → /problems/:slug
  → AI Assistance → /chats → ConversationView
  → Saved Items → /favorites
```

#### 4. Content Creation Flow
```
/problems 
  → Create Problem → Problem form
  → /public-policy → Policy creation
  → /policy-portal (admin) → Draft management
  → /chats → AI assistance
```

#### 5. Admin User Flow
```
/admin 
  → User Management → User controls
  → /style-guide → Design system
  → /image-system → Asset management
  → /playground → AI testing
  → /feed → Activity monitoring
```

### Navigation Entry Points

#### Primary Navigation (Always Available)
- Landing page header navigation
- Sidebar navigation (authenticated users)
- Command palette (Ctrl+K)

#### Secondary Navigation
- Breadcrumbs (contextual pages)
- Related content links
- Cross-references between pages

### Decision Points

#### Authentication Gate
- Public pages: Landing, Auth, Problem pages
- Protected pages: All others
- Admin pages: Subset requiring admin role

#### User Role Branching
- **Public**: Landing → Auth → (if approved) → Home
- **Authenticated**: Full app access except admin pages
- **Admin**: Full app access including admin pages

---

## Page Relationships

### Parent-Child Relationships

#### Landing (/) 
- Children: /auth, /problems/:slug
- Siblings: /alt
- Modals: Problem chat sheet, waitlist form

#### Home (/home)
- Children: /dashboard, /bills, /members, /committees, /problems, /chats, /favorites
- Parent: /auth (login flow)
- Siblings: /home-2

#### Bills (/bills)
- Parent: /home, /dashboard
- Children: BillDetail modal
- Related: /members (sponsors), /committees (assignments)

#### Problems (/problems)
- Parent: /home
- Children: /problems/:slug
- Related: /public-policy, /chats

#### Chat Sessions (/chats)
- Parent: /home
- Children: ConversationView
- Related: /bills, /members, /committees (contextual chats)

### Cross-Page Dependencies

#### Data Sharing
- Bills ↔ Members ↔ Committees (legislative data)
- Problems → Public Policy → Chats (policy development)
- Profile ↔ Plans (subscription management)
- Favorites → Bills/Members/Committees (saved items)

#### Navigation Flows
- Dashboard → Bills/Members/Committees (quick access)
- Problems → Problem Chat → Solutions
- Profile → Plans → Subscription management

---

## Component Hierarchy

### Global Layout Components

#### App Structure
```
App
├── QueryClientProvider
├── AuthProvider
├── ModelProvider
├── BrowserRouter
└── Routes
    ├── Public Routes (Landing, Auth, Problem pages)
    └── Protected Routes (AppLayout)
        ├── SidebarProvider
        ├── AppSidebar
        │   ├── SidebarHeader
        │   ├── SidebarSearch
        │   ├── SidebarNavigation
        │   └── SidebarFooter
        └── SidebarInset
            ├── Header (ModelSelector, ThemeToggle)
            ├── ScrollProgress
            ├── PageTransition
            └── Main Content (Page Routes)
```

### Shared Components

#### Navigation
- **AppSidebar**: Main navigation sidebar
- **SidebarNavigation**: Navigation menu items
- **HeartSidebarTrigger**: Sidebar toggle button
- **CommandPalette**: Quick search/navigation

#### UI Framework
- **shadcn/ui components**: Base UI library
- **Radix UI primitives**: Accessible components
- **Tailwind CSS**: Styling system

#### Feature Components
- **ModelSelector**: AI model switching
- **ThemeToggle**: Dark/light mode
- **ProtectedRoute**: Authentication wrapper
- **PageTransition**: Smooth page transitions

### Page-Specific Component Hierarchies

#### Bills Page
```
Bills
├── BillsHeader
├── BillsSearchFilters
├── BillsGrid
│   └── BillCard[]
├── BillsLoadingSkeleton
├── BillsErrorState
├── BillsEmptyState
└── BillDetail (modal)
```

#### Chat Page
```
Chats
├── ChatsEmptyState
├── ChatsLoadingSkeleton
├── ChatSessionCard[]
└── ConversationView
    ├── MessageBubble[]
    └── ChatInput
```

#### Image System
```
ImageSystem
├── ImageUploadArea
├── ImageFilters
├── ImageCard[]
└── ImagePreviewDialog
```

### Reusable Feature Components

#### Problem System
- **ProblemChatSheet**: Problem discussion interface
- **ProblemCollabStream**: Collaboration stream
- **StarRating**: Rating and voting system

#### Legislative Components
- **BillDetail**: Bill information modal
- **MemberCard**: Legislator information
- **CommitteeCard**: Committee information

---

## State Management Flow

### Global State (React Context)

#### AuthContext
- **Purpose**: User authentication and session management
- **Data**: user, loading, isAdmin, isAllowedUser
- **Consumers**: All protected components
- **Flow**: App initialization → Auth check → Route protection

#### ModelContext
- **Purpose**: AI model selection and management
- **Data**: selectedModel, setSelectedModel
- **Consumers**: AI-enabled components (Chat, Playground)
- **Flow**: User selection → Global model state → AI API calls

### Local State Management

#### Page-Level State
- **Search/Filter states**: Bills, Members, Committees pages
- **Modal states**: BillDetail, ImagePreview
- **Form states**: Auth, Profile, Contact forms
- **UI states**: Loading, error, empty states

#### Component State
- **Input states**: Search terms, form data
- **Display states**: Expanded/collapsed, active tabs
- **Interaction states**: Hover, focus, selected items

### Data Flow Patterns

#### API Data Flow
```
Component Mount 
  → useEffect trigger
  → Supabase query
  → Loading state
  → Data received
  → State update
  → UI render
```

#### User Interaction Flow
```
User Action 
  → Event handler
  → State update
  → Optimistic UI update
  → API call
  → Response handling
  → Final state update
```

### Caching Strategy

#### React Query Integration
- **Purpose**: Server state management and caching
- **Usage**: API calls, data fetching, mutations
- **Benefits**: Automatic caching, background updates, optimistic updates

#### Local Storage
- **Theme preference**: Dark/light mode persistence
- **User preferences**: Model selection, sidebar state
- **Session data**: Temporary form data, search history

---

## Visual Sitemap

```
Goodable Platform Sitemap

PUBLIC ACCESS
├── Landing Page (/)
│   ├── Hero Section
│   ├── Features Demo
│   ├── Pricing Plans
│   ├── FAQ Section
│   └── Waitlist Signup
├── Alt Landing (/alt)
├── Authentication (/auth, /auth-2)
└── Public Problems (/problems/:slug)

AUTHENTICATED ACCESS
├── Home (/home, /home-2)
├── Dashboard (/dashboard)
│
├── LEGISLATIVE RESEARCH
│   ├── Bills (/bills)
│   │   └── [Bill Detail Modal]
│   ├── Members (/members)
│   └── Committees (/committees)
│
├── WORKFLOW
│   ├── Problems (/problems)
│   │   └── Problem Pages (/:slug)
│   ├── Public Policy (/public-policy)
│   ├── Chat Sessions (/chats)
│   │   └── [Conversation View]
│   └── Favorites (/favorites)
│
├── CONTENT
│   ├── Blog (/blog)
│   │   └── Blog Posts (/blog/:id)
│   └── Feed (/feed) [Admin Only]
│
├── USER MANAGEMENT
│   ├── Profile (/profile)
│   ├── Plans (/plans)
│   ├── About (/about)
│   └── Changelog (/changelog)
│
└── ADMIN TOOLS [Admin Only]
    ├── Control Panel (/admin)
    ├── Design System (/style-guide)
    ├── Image System (/image-system)
    ├── Playground (/playground)
    ├── Policy Portal (/policy-portal)
    ├── ShadCN Showcase (/shadcn-showcase)
    └── Test Pages
        ├── Image Upload Test (/image-upload-test)
        └── Sticky Headers Test
```

### Access Control Summary

- **Public (4 pages)**: Landing pages, auth, public problems
- **Authenticated (16 pages)**: Main app functionality
- **Admin Only (8 pages)**: Administrative and development tools
- **Total Active Routes**: 28 pages + modals/components

### Key Integration Points

1. **Authentication Gateway**: `/auth` → `/home` (approved) or `/` (waitlist)
2. **Legislative Hub**: `/bills` ↔ `/members` ↔ `/committees` (interconnected)
3. **Problem-Solution Flow**: `/problems` → `/public-policy` → `/chats`
4. **Admin Control Center**: `/admin` → all admin tools
5. **User Journey**: `/` → `/auth` → `/home` → feature pages

This comprehensive documentation provides a complete overview of the Goodable platform's structure, user flows, and component relationships, serving as a definitive guide for development and maintenance.