# Goodable Site Architecture Dictionary

## Table of Contents
- [Page 1: Landing Page (Waitlist)](#page-1-landing-page-waitlist) - `/`

---

## Pages

### Page 1: Landing Page (Waitlist)
- **URL Path:** `/`
- **File Location:** `src/pages/Landing-Page-Waitlist.tsx`
- **React Component:** `LandingPageWaitlist`
- **Purpose:** Main landing page with waitlist signup and community engagement features

#### Sections:

**Section 1 (Hero)**
- **Component:** Hero section (embedded in LandingPageWaitlist)
- **Content:**
  - H1: "Do something, something good."
  - Subheading: "The only comprehensive platform for tracking legislation, analyzing policy impacts, and crowd sourced policy solutions. Powered by advanced AI and driven by collaboration."
  - Two buttons: "Play" and "Learn"
  - Hero video component
- **Behavior:** 
  - Play button scrolls to playground section
  - Learn button routes to `/auth-2`
  - Video click routes to `/auth-2`

**Section 2 (Alpha Banner)**
- **Component:** Alpha announcement banner (embedded in LandingPageWaitlist)
- **Content:**
  - "New" badge with rainbow border animation
  - "Goodable is now in alpha." text
  - "Learn More" button (hidden on mobile)
- **Behavior:** 
  - Entire banner is clickable and routes to `/auth-2`
  - Rainbow border animation using MagicUI ShineBorder

**Section 3 (Marquee)**
- **Component:** Marquee section (embedded in LandingPageWaitlist)
- **Header:** "Public Policy, But Different"
- **Subheader:** "We think that's good."
- **Content:**
  - Two scrolling marquees with member cards and problem cards
  - Gradient fade effects on sides
- **Behavior:** 
  - Cards route to `/auth-2` on click
  - Pause on hover

**Section 4 (Features Grid)**
- **Component:** Features section (embedded in LandingPageWaitlist)
- **Header:** "Everything You Need To"
- **Subheader:** "Do something."
- **Content:**
  - 6 feature cards: Legislative Intelligence, Member Profiles, AI Policy Assistant, Committee Tracking, Bills and Resolutions, Community Solutions
  - Each card has: icon, title, description, gradient background
- **Behavior:** 
  - Member Profiles card has blue hover border and routes to `/members`
  - All other cards route to `/auth-2`

**Section 5 (Analytics Charts)**
- **Component:** Analytics section (embedded in LandingPageWaitlist)
- **Header:** "A Common View"
- **Subheader:** "For the road ahead."
- **Content:**
  - 4 interactive charts: Area, Bar, Pie, Line
  - Top row: Large interactive chart
  - Bottom row: Three smaller charts
- **Behavior:** 
  - Charts are interactive with hover effects

**Section 6 (Problems Bento Grid)**
- **Component:** `ProblemsBentoGrid`
- **Header:** "Problem Statements"
- **Subheader:** "You decide what matters."
- **Content:**
  - Problem cards: Childcare, Quality Time, Third Place, Climate Change, Income Stagnation, End Stage Capitalism
  - Each card has: voting arrows, vote count, comment count, priority badge
  - "Load More" and "View All" buttons
- **Behavior:** 
  - Cards route to `/auth-2` on click
  - Voting requires authentication

**Section 7 (Policy Proposals)**
- **Component:** Policy Proposals section (embedded in LandingPageWaitlist)
- **Header:** "Policy Proposals"
- **Subheader:** "You decide what works."
- **Content:**
  - Policy cards with titles, descriptions, topic tags
  - Voting and comment functionality
  - "Load More" and "View All" buttons
- **Behavior:** 
  - Cards route to `/auth-2` on click
  - Voting requires authentication

**Section 8 (Feature Chat)**
- **Component:** `FeatureChat`
- **Content:**
  - AI chat playground interface
  - Interactive chat with policy analysis
- **Behavior:** 
  - Fully functional chat interface
  - No authentication required

**Section 9 (Blog Carousel)**
- **Component:** `HorizontalBlogCarousel`
- **Header:** "Good Trouble?"
- **Subheader:** "Browse Goodable's original policy proposals"
- **Content:**
  - Blog cards with hero images
  - Article metadata (date, category)
  - Carousel navigation arrows
- **Behavior:** 
  - Cards route to `/auth-2` on click
  - Horizontal scroll with arrow navigation

**Section 10 (FAQ)**
- **Component:** `FAQ`
- **Content:**
  - Frequently asked questions in accordion format
- **Behavior:** 
  - Expandable/collapsible sections

**Section 11 (Pricing)**
- **Component:** Pricing section (embedded in LandingPageWaitlist)
- **Header:** "Simple, Transparent Pricing"
- **Subheader:** "Choose the plan that fits your needs"
- **Content:**
  - 3 pricing plan cards: Free, Staffer (Popular), Professional
  - Feature lists with checkmarks
  - CTA buttons for each plan
  - "View All Plans" button
- **Behavior:** 
  - All buttons route to `/auth-2`
  - Popular plan highlighted with blue border

**Section 12 (CTA/Waitlist)**
- **Component:** CTA section (embedded in LandingPageWaitlist)
- **Header:** "Good trouble? That's Goodable."
- **Subheader:** "Join thousands collaborating on a new vision for public policy."
- **Content:**
  - Email input field
  - "Join Waitlist" button with heart icon
  - ShineBorder animation around entire section
  - Confetti effect on hover
- **Behavior:** 
  - Email validation and submission to Supabase
  - Success/error toast notifications
  - Confetti animation trigger

**Section 13 (Footer)**
- **Component:** Footer section (embedded in LandingPageWaitlist)
- **Content:**
  - Logo and tagline: "Do something, something good."
  - Four columns: Product, Company, Connect
  - Social media icons
  - Copyright notice
- **Behavior:** 
  - Most links route to `https://www.goodable.dev/#`
  - Some links route to `/auth-2`

---

## Usage Examples

### Good Communication:
- "In Page 1, Section 3, fix the card click routing"
- "Update Page 1, Section 1 hero headline"
- "In Landing-Page-Waitlist.tsx, Section 5, change carousel to show 4 cards"

### Poor Communication (requires clarification):
- "Fix the cards" 
- "Update landing page"
- "Change the voting"

---

*Last Updated: August 3, 2025*
*Next Page to Document: [TBD]*