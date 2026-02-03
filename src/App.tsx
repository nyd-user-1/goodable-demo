// New Branch version - deployed to Vercel
import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PageTransition } from "@/components/PageTransition";
import { SearchModal } from "@/components/SearchModal";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useHubSpot } from "@/hooks/useHubSpot";

// Lazy-loaded page components
const Auth = React.lazy(() => import("./pages/Auth"));
const Auth4 = React.lazy(() => import("./pages/Auth4"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Bills = React.lazy(() => import("./pages/Bills"));
const Members = React.lazy(() => import("./pages/Members"));
const Committees = React.lazy(() => import("./pages/Committees"));
const NewChat = React.lazy(() => import("./pages/NewChat"));
const Plans = React.lazy(() => import("./pages/Plans"));
const About = React.lazy(() => import("./pages/About"));
const History = React.lazy(() => import("./pages/History"));
const Academy = React.lazy(() => import("./pages/Academy"));
const Features = React.lazy(() => import("./pages/Features"));
const AIFluency = React.lazy(() => import("./pages/AIFluency"));
const UseCases = React.lazy(() => import("./pages/UseCases"));
const UseCasesBills = React.lazy(() => import("./pages/UseCasesBills"));
const UseCasesCommittees = React.lazy(() => import("./pages/UseCasesCommittees"));
const UseCasesMembers = React.lazy(() => import("./pages/UseCasesMembers"));
const UseCasesPolicy = React.lazy(() => import("./pages/UseCasesPolicy"));
const UseCasesDepartments = React.lazy(() => import("./pages/UseCasesDepartments"));
const Nonprofits = React.lazy(() => import("./pages/Nonprofits"));
const NonprofitEconomicAdvocacy = React.lazy(() => import("./pages/NonprofitEconomicAdvocacy"));
const NonprofitEnvironmentalAdvocacy = React.lazy(() => import("./pages/NonprofitEnvironmentalAdvocacy"));
const NonprofitLegalAdvocacy = React.lazy(() => import("./pages/NonprofitLegalAdvocacy"));
const NonprofitSocialAdvocacy = React.lazy(() => import("./pages/NonprofitSocialAdvocacy"));
const NonprofitDirectory = React.lazy(() => import("./pages/NonprofitDirectory"));
const ExcerptView = React.lazy(() => import("./pages/ExcerptView"));
const NoteView = React.lazy(() => import("./pages/NoteView"));
const NewNote = React.lazy(() => import("./pages/NewNote"));
const Contracts = React.lazy(() => import("./pages/Contracts"));
const ContractDetail = React.lazy(() => import("./pages/ContractDetail"));
const Budget = React.lazy(() => import("./pages/Budget"));
const BudgetDashboard = React.lazy(() => import("./pages/BudgetDashboard"));
const Lobbying = React.lazy(() => import("./pages/Lobbying"));
const LobbyingDetail = React.lazy(() => import("./pages/LobbyingDetail"));
const SchoolFunding = React.lazy(() => import("./pages/SchoolFunding"));
const SchoolFundingDetail = React.lazy(() => import("./pages/SchoolFundingDetail"));
const Committees2 = React.lazy(() => import("./pages/Committees2"));
const Members2 = React.lazy(() => import("./pages/Members2"));
const Bills2 = React.lazy(() => import("./pages/Bills2"));
const Chats2 = React.lazy(() => import("./pages/Chats2"));
const Constitution = React.lazy(() => import("./pages/Constitution"));
const DigitalBillOfRights = React.lazy(() => import("./pages/DigitalBillOfRights"));
const LiveFeed = React.lazy(() => import("./pages/LiveFeed"));
const Prompts = React.lazy(() => import("./pages/Prompts"));
const PromptHub = React.lazy(() => import("./pages/PromptHub"));
const DepartmentDetail = React.lazy(() => import("./pages/DepartmentDetail"));
const FeedPage = React.lazy(() => import("./pages/FeedPage"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-muted-foreground">Loading...</div>
  </div>
);

// HubSpot tracker component - must be inside AuthProvider to access auth context
function HubSpotTracker() {
  useHubSpot();
  return null;
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ModelProvider>
            <Toaster />
            <Sonner />
            <SpeedInsights />
            <Analytics />
            <BrowserRouter>
              <HubSpotTracker />
              <ScrollToTop />
              <SearchModal />
              <Suspense fallback={<LoadingFallback />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<NewChat />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-4" element={<Auth4 />} />
                  <Route path="/live-feed" element={<LiveFeed />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/academy" element={<Academy />} />
                  <Route path="/constitution" element={<Constitution />} />
                  <Route path="/digital-bill-of-rights" element={<DigitalBillOfRights />} />
                  <Route path="/ai-fluency" element={<AIFluency />} />
                  <Route path="/new-prompts" element={<PromptHub />} />
                  <Route path="/use-cases" element={<UseCases />} />
                  <Route path="/use-cases/bills" element={<UseCasesBills />} />
                  <Route path="/use-cases/committees" element={<UseCasesCommittees />} />
                  <Route path="/use-cases/members" element={<UseCasesMembers />} />
                  <Route path="/use-cases/policy" element={<UseCasesPolicy />} />
                  <Route path="/use-cases/departments" element={<UseCasesDepartments />} />
                  <Route path="/nonprofits" element={<Nonprofits />} />
                  <Route path="/nonprofits/economic-advocacy" element={<NonprofitEconomicAdvocacy />} />
                  <Route path="/nonprofits/environmental-advocacy" element={<NonprofitEnvironmentalAdvocacy />} />
                  <Route path="/nonprofits/legal-advocacy" element={<NonprofitLegalAdvocacy />} />
                  <Route path="/nonprofits/social-advocacy" element={<NonprofitSocialAdvocacy />} />
                  <Route path="/nonprofits/directory" element={<NonprofitDirectory />} />
                  <Route path="/new-note" element={<ProtectedRoute><NewNote /></ProtectedRoute>} />
                  <Route path="/n/:noteId" element={<ProtectedRoute><NoteView /></ProtectedRoute>} />
                  <Route path="/e/:excerptId" element={<ProtectedRoute><ExcerptView /></ProtectedRoute>} />
                  <Route path="/new-chat" element={<ProtectedRoute><NewChat /></ProtectedRoute>} />
                  <Route path="/c/:sessionId" element={<ProtectedRoute><NewChat /></ProtectedRoute>} />
                  <Route path="/bills" element={<ProtectedRoute><Bills2 /></ProtectedRoute>} />
                  <Route path="/bills/:billNumber" element={<ProtectedRoute><Bills /></ProtectedRoute>} />
                  <Route path="/committees" element={<ProtectedRoute><Committees2 /></ProtectedRoute>} />
                  <Route path="/committees/:committeeSlug" element={<ProtectedRoute><Committees /></ProtectedRoute>} />
                  <Route path="/members" element={<ProtectedRoute><Members2 /></ProtectedRoute>} />
                  <Route path="/members/:memberSlug" element={<ProtectedRoute><Members /></ProtectedRoute>} />
                  <Route path="/school-funding" element={<ProtectedRoute><SchoolFunding /></ProtectedRoute>} />
                  <Route path="/school-funding/:fundingId" element={<ProtectedRoute><SchoolFundingDetail /></ProtectedRoute>} />
                  <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                  <Route path="/contracts/:contractNumber" element={<ProtectedRoute><ContractDetail /></ProtectedRoute>} />
                  <Route path="/lobbying" element={<ProtectedRoute><Lobbying /></ProtectedRoute>} />
                  <Route path="/lobbying/:id" element={<ProtectedRoute><LobbyingDetail /></ProtectedRoute>} />
                  <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
                  <Route path="/budget-dashboard" element={<ProtectedRoute><BudgetDashboard /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/departments" element={<ProtectedRoute><Prompts /></ProtectedRoute>} />
                  <Route path="/departments/:slug" element={<ProtectedRoute><DepartmentDetail /></ProtectedRoute>} />
                  <Route path="/chats" element={<ProtectedRoute><Chats2 /></ProtectedRoute>} />
                  <Route path="/plans" element={<ProtectedRoute><Plans /></ProtectedRoute>} />
                  <Route path="/feed" element={<ProtectedRoute><FeedPage /></ProtectedRoute>} />
                </Routes>
              </PageTransition>
              </Suspense>
            </BrowserRouter>
          </ModelProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
