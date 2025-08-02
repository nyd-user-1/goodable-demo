# Goodable Landing Page Components Dictionary

This document provides clear definitions of the different card sections on the landing page (`/`) to prevent confusion during development.

## Section 1: Problem Statements
**Location:** Upper section of landing page  
**Header:** "Problem Statements"  
**Subheader:** "You decide what matters."

### Description
Community-driven problem identification cards where users can vote on societal issues.

### Cards Include
- Childcare
- Quality Time  
- Third Place
- Climate Change
- Income Stagnation
- End Stage Capitalism

### Features
- Up/down voting arrows with vote counts
- Comment counts (message icon + number)
- Priority badges (Destructive, Warning, Normal, Default)
- "Load More" and "View All" buttons

### Technical Details
- **Component:** `ProblemsBentoGrid`
- **File Path:** `/src/components/features/problems/ProblemsBentoGrid.tsx`
- **Current Behavior:** ✅ Routes to `/auth-2` on click
- **Status:** Functioning correctly

---

## Section 2: Policy Proposals  
**Location:** Middle section of landing page  
**Header:** "Policy Proposals"  
**Subheader:** "You decide what works."

### Description
Detailed policy proposal cards featuring comprehensive solutions to societal challenges.

### Cards Include
- Climate Resilience at a Crossroads
- Mental Health Support: Bridging the Care Divide
- Food Security: Ending Hunger in Our Communities
- Housing Crisis: Keeping Communities Together
- Digital Rights: Protecting Freedom and Privacy Online
- Digital Transformation Cognitive Disconnect: Policy Brief

### Features
- Up/down voting arrows with vote counts
- Comment counts (message icon + number)
- Topic tags/badges (climate change, mental health, food security, etc.)
- "Load More" and "View All" buttons

### Technical Details
- **Component:** `BlogProposalGrid` (needs investigation)
- **File Path:** TBD - needs to be located
- **Current Behavior:** ❌ No click functionality 
- **Required Fix:** Need to add routing to `/auth-2` on card click

---

## Section 3: Good Trouble Blog Cards
**Location:** Lower section of landing page  
**Header:** "Good Trouble?"  
**Subheader:** "Browse Goodable's original policy proposals"

### Description
Blog-style article cards featuring Goodable's original content with hero images.

### Cards Include
- Creating Accessible Web Applications with React and ARIA
- The Future of Design Systems in 2023
- Optimizing Performance in Next.js Applications
- Crafting Effective User Onboarding Experiences

### Features
- Hero images with hover zoom effect
- Article metadata (date, category)
- "Read more" buttons
- Horizontal carousel with navigation arrows

### Technical Details
- **Component:** `HorizontalBlogCarousel`
- **File Path:** `/src/components/HorizontalBlogCarousel.tsx`
- **Current Behavior:** ✅ Routes to `/auth-2` on click (recently added)
- **Status:** Functioning correctly

---

## Visual Identification Guide

### Problem Statements Cards
- Simple text-based cards
- Voting arrows are prominent
- Priority badges with colors (red=Destructive, orange=Warning, etc.)
- No images

### Policy Proposals Cards  
- Text-based cards with policy descriptions
- Topic tags in colored badges
- Voting and comment functionality
- No images

### Good Trouble Blog Cards
- **Has hero images** - this is the key visual identifier
- Looks like traditional blog post cards
- "Read more" buttons instead of voting
- Horizontal scrolling carousel layout

---

## Development Notes

- When referencing cards in conversation, always specify the section name
- Use component names when discussing technical implementation
- Policy Proposals section needs immediate attention for click functionality
- All three sections should route to `/auth-2` for unauthenticated users

---

*Last Updated: August 2, 2025*