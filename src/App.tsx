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
import { NewAppSidebar } from "@/components/NewAppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/PageHeader";

// Lazy-loaded page components
const Landing = React.lazy(() => import("./pages/Landing"));
const Home = React.lazy(() => import("./pages/Home"));
const Home2 = React.lazy(() => import("./pages/Home-2"));
const Index = React.lazy(() => import("./pages/Index"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Auth2 = React.lazy(() => import("./pages/Auth2"));
const Auth4 = React.lazy(() => import("./pages/Auth4"));
const ShadcnShowcase = React.lazy(() => import("./pages/ShadcnShowcase"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Bills = React.lazy(() => import("./pages/Bills"));
const Members = React.lazy(() => import("./pages/Members"));
const Committees = React.lazy(() => import("./pages/Committees"));
const LawsAdmin = React.lazy(() => import("./pages/LawsAdmin"));
const LawsTest = React.lazy(() => import("./pages/LawsTest"));
const LawsClean = React.lazy(() => import("./pages/LawsClean"));
const LawsAdminWorking = React.lazy(() => import("./pages/LawsAdminWorking"));
const NewChat = React.lazy(() => import("./pages/NewChat"));
const NewChat2 = React.lazy(() => import("./pages/NewChat2"));
const Playground = React.lazy(() => import("./pages/Playground"));
const PolicyPortal = React.lazy(() => import("./pages/PolicyPortal"));
const PolicyLab = React.lazy(() => import("./pages/PolicyLab"));
const Plans = React.lazy(() => import("./pages/Plans"));
const ChangeLog = React.lazy(() => import("./pages/ChangeLog"));
const ProblemPage = React.lazy(() => import("./pages/ProblemPage"));
const Problems = React.lazy(() => import("./pages/Problems"));
const About = React.lazy(() => import("./pages/About"));
const Academy = React.lazy(() => import("./pages/Academy"));
const Features = React.lazy(() => import("./pages/Features"));
const Features2 = React.lazy(() => import("./pages/Features-2"));
const Pricing = React.lazy(() => import("./pages/Pricing"));
const AIFluency = React.lazy(() => import("./pages/AIFluency"));
const UseCases = React.lazy(() => import("./pages/UseCases"));
const UseCasesBills = React.lazy(() => import("./pages/UseCasesBills"));
const UseCasesCommittees = React.lazy(() => import("./pages/UseCasesCommittees"));
const UseCasesMembers = React.lazy(() => import("./pages/UseCasesMembers"));
const UseCasesPolicy = React.lazy(() => import("./pages/UseCasesPolicy"));
const Nonprofits = React.lazy(() => import("./pages/Nonprofits"));
const NonprofitEconomicAdvocacy = React.lazy(() => import("./pages/NonprofitEconomicAdvocacy"));
const NonprofitEnvironmentalAdvocacy = React.lazy(() => import("./pages/NonprofitEnvironmentalAdvocacy"));
const NonprofitLegalAdvocacy = React.lazy(() => import("./pages/NonprofitLegalAdvocacy"));
const NonprofitSocialAdvocacy = React.lazy(() => import("./pages/NonprofitSocialAdvocacy"));
const NonprofitDirectory = React.lazy(() => import("./pages/NonprofitDirectory"));
const PublicPolicy = React.lazy(() => import("./pages/PublicPolicy"));
const StyleGuide = React.lazy(() => import("./pages/StyleGuide"));
const ImageSystem = React.lazy(() => import("./pages/ImageSystem"));
const Blog = React.lazy(() => import("./pages/Blog"));
const BlogPost = React.lazy(() => import("./pages/BlogPost"));
const Admin = React.lazy(() => import("./pages/Admin"));
const FeedPage = React.lazy(() => import("./pages/FeedPage"));
const ImageUploadTest = React.lazy(() => import("./pages/ImageUploadTest"));
const Customerstory = React.lazy(() => import("./pages/Customerstory"));
const DataPopulator = React.lazy(() => import("./pages/DataPopulator"));
const RealABCPopulator = React.lazy(() => import("./pages/RealABCPopulator"));
const FixABCStructure = React.lazy(() => import("./pages/FixABCStructure"));
const ExcerptView = React.lazy(() => import("./pages/ExcerptView"));
const NoteView = React.lazy(() => import("./pages/NoteView"));
const NewNote = React.lazy(() => import("./pages/NewNote"));
const FreeTrial = React.lazy(() => import("./pages/FreeTrial"));
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
const DepartmentDetail = React.lazy(() => import("./pages/DepartmentDetail"));

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

const AppLayout = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <NewAppSidebar />
        <SidebarInset>
          <PageHeader />
          <div className="flex-1 overflow-auto pt-[72px] md:pt-0">
            <PageTransition>
              <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/home-2" element={<Home2 />} />
              <Route path="/new-chat-2" element={<NewChat2 />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/policy-portal" element={<PolicyPortal />} />
              <Route path="/policy-lab" element={<PolicyLab />} />
              <Route path="/bills/:billNumber" element={<Bills />} />
              <Route path="/contracts/:contractNumber" element={<ContractDetail />} />
              <Route path="/lobbying/:id" element={<LobbyingDetail />} />
              <Route path="/school-funding/:fundingId" element={<SchoolFundingDetail />} />

              <Route path="/members/:memberSlug" element={<Members />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/laws" element={<LawsClean />} />
              <Route path="/laws/admin" element={<LawsAdminWorking />} />
              <Route path="/laws/admin-full" element={<LawsAdmin />} />
              <Route path="/laws/test" element={<LawsTest />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/changelog" element={<ChangeLog />} />
              <Route path="/public-policy" element={<PublicPolicy />} />
              <Route path="/style-guide" element={<StyleGuide />} />
              <Route path="/image-system" element={<ImageSystem />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/feed" element={<FeedPage />} />
              <Route path="/shadcn-showcase" element={<ShadcnShowcase />} />
              <Route path="/image-upload-test" element={<ImageUploadTest />} />
              <Route path="/customerstory" element={<Customerstory />} />
              <Route path="/data-populator" element={<DataPopulator />} />
              <Route path="/real-abc-populator" element={<RealABCPopulator />} />
              <Route path="/fix-abc-structure" element={<FixABCStructure />} />
              </Routes>
            </PageTransition>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

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
            <HubSpotTracker />
            <BrowserRouter>
              <ScrollToTop />
              <SearchModal />
              <Suspense fallback={<LoadingFallback />}>
              <PageTransition>
                <Routes>
            <Route path="/" element={<NewChat />} />                  <Route path="/alt" element={<Landing />} />
                              <Route path="/features" element={<Features />} />
                  <Route path="/features-2" element={<Features2 />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-2" element={<Auth2 />} />
                  <Route path="/auth-4" element={<Auth4 />} />
                  <Route path="/free-trial" element={<FreeTrial />} />
                  <Route path="/live-feed" element={<LiveFeed />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/academy" element={<Academy />} />
                  <Route path="/constitution" element={<Constitution />} />
                  <Route path="/digital-bill-of-rights" element={<DigitalBillOfRights />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/ai-fluency" element={<AIFluency />} />
                  <Route path="/use-cases" element={<UseCases />} />
                  <Route path="/use-cases/bills" element={<UseCasesBills />} />
                  <Route path="/use-cases/committees" element={<UseCasesCommittees />} />
                  <Route path="/use-cases/members" element={<UseCasesMembers />} />
                  <Route path="/use-cases/policy" element={<UseCasesPolicy />} />
                  <Route path="/nonprofits" element={<Nonprofits />} />
                  <Route path="/nonprofits/economic-advocacy" element={<NonprofitEconomicAdvocacy />} />
                  <Route path="/nonprofits/environmental-advocacy" element={<NonprofitEnvironmentalAdvocacy />} />
                  <Route path="/nonprofits/legal-advocacy" element={<NonprofitLegalAdvocacy />} />
                  <Route path="/nonprofits/social-advocacy" element={<NonprofitSocialAdvocacy />} />
                  <Route path="/nonprofits/directory" element={<NonprofitDirectory />} />
                  <Route path="/problems/:problemSlug" element={<ProblemPage />} />
                  <Route path="/new-note" element={<ProtectedRoute><NewNote /></ProtectedRoute>} />
                  <Route path="/n/:noteId" element={<ProtectedRoute><NoteView /></ProtectedRoute>} />
                  <Route path="/e/:excerptId" element={<ProtectedRoute><ExcerptView /></ProtectedRoute>} />
                  <Route path="/new-chat" element={<ProtectedRoute><NewChat /></ProtectedRoute>} />
                  <Route path="/c/:sessionId" element={<ProtectedRoute><NewChat /></ProtectedRoute>} />
                  <Route path="/bills" element={<ProtectedRoute><Bills2 /></ProtectedRoute>} />
                  <Route path="/committees" element={<ProtectedRoute><Committees2 /></ProtectedRoute>} />
                  <Route path="/committees/:committeeSlug" element={<ProtectedRoute><Committees /></ProtectedRoute>} />
                  <Route path="/members" element={<ProtectedRoute><Members2 /></ProtectedRoute>} />
                  <Route path="/school-funding" element={<ProtectedRoute><SchoolFunding /></ProtectedRoute>} />
                  <Route path="/contracts" element={<ProtectedRoute><Contracts /></ProtectedRoute>} />
                  <Route path="/lobbying" element={<ProtectedRoute><Lobbying /></ProtectedRoute>} />
                  <Route path="/budget" element={<ProtectedRoute><Budget /></ProtectedRoute>} />
                  <Route path="/budget-dashboard" element={<ProtectedRoute><BudgetDashboard /></ProtectedRoute>} />

                  <Route path="/departments" element={<ProtectedRoute><Prompts /></ProtectedRoute>} />
                  <Route path="/departments/:slug" element={<ProtectedRoute><DepartmentDetail /></ProtectedRoute>} />
                  <Route path="/chats" element={<ProtectedRoute><Chats2 /></ProtectedRoute>} />
                  <Route path="*" element={<AppLayout />} />
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
