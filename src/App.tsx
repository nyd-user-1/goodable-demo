// New Branch version - deployed to Vercel
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
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NewAppSidebar } from "@/components/NewAppSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { PageHeader } from "@/components/PageHeader";
import Landing from "./pages/Landing";
import LandingPageWaitlist from "./pages/Landing-Page-Waitlist";
import Home from "./pages/Home";
import Home2 from "./pages/Home-2";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import Auth2 from "./pages/Auth2";
import ShadcnShowcase from "./pages/ShadcnShowcase";
import Profile from "./pages/Profile";
import Bills from "./pages/Bills";
import Members from "./pages/Members";
import Committees from "./pages/Committees";
import Laws from "./pages/Laws";
import LawsAdmin from "./pages/LawsAdmin";
import LawsAdminSimple from "./pages/LawsAdminSimple";
import LawsTest from "./pages/LawsTest";
import LawsMinimal from "./pages/LawsMinimal";
import LawsClean from "./pages/LawsClean";
import LawsAdminWorking from "./pages/LawsAdminWorking";
import Chats from "./pages/Chats";
import NewChat from "./pages/NewChat";
import NewChat2 from "./pages/NewChat2";
import Favorites from "./pages/Favorites";
import Playground from "./pages/Playground";
import PolicyPortal from "./pages/PolicyPortal";
import PolicyLab from "./pages/PolicyLab";
import Plans from "./pages/Plans";
import ChangeLog from "./pages/ChangeLog";
import ProblemPage from "./pages/ProblemPage";
import Problems from "./pages/Problems";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import AIFluency from "./pages/AIFluency";
import UseCasesBills from "./pages/UseCasesBills";
import UseCasesCommittees from "./pages/UseCasesCommittees";
import UseCasesMembers from "./pages/UseCasesMembers";
import UseCasesPolicy from "./pages/UseCasesPolicy";
import NonprofitEconomicAdvocacy from "./pages/NonprofitEconomicAdvocacy";
import NonprofitEnvironmentalAdvocacy from "./pages/NonprofitEnvironmentalAdvocacy";
import NonprofitLegalAdvocacy from "./pages/NonprofitLegalAdvocacy";
import NonprofitSocialAdvocacy from "./pages/NonprofitSocialAdvocacy";
import NonprofitDirectory from "./pages/NonprofitDirectory";
import PublicPolicy from "./pages/PublicPolicy";
import StyleGuide from "./pages/StyleGuide";
import ImageSystem from "./pages/ImageSystem";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Admin from "./pages/Admin";
import FeedPage from "./pages/FeedPage";
import ImageUploadTest from "./pages/ImageUploadTest";
import Customerstory from "./pages/Customerstory";
import DataPopulator from "./pages/DataPopulator";
import RealABCPopulator from "./pages/RealABCPopulator";
import FixABCStructure from "./pages/FixABCStructure";
import ExcerptView from "./pages/ExcerptView";
import FreeTrial from "./pages/FreeTrial";
import Contracts from "./pages/Contracts";
import Committees2 from "./pages/Committees2";
import Members2 from "./pages/Members2";
import Bills2 from "./pages/Bills2";
import Chats2 from "./pages/Chats2";
import Constitution from "./pages/Constitution";
import DigitalBillOfRights from "./pages/DigitalBillOfRights";

const queryClient = new QueryClient();

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
              <Route path="/new-chat" element={<NewChat />} />
              <Route path="/c/:sessionId" element={<NewChat />} />
              <Route path="/e/:excerptId" element={<ExcerptView />} />
              <Route path="/new-chat-2" element={<NewChat2 />} />
              <Route path="/chats" element={<Chats2 />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/playground" element={<Playground />} />
              <Route path="/policy-portal" element={<PolicyPortal />} />
              <Route path="/policy-lab" element={<PolicyLab />} />
              <Route path="/bills" element={<Bills2 />} />
              <Route path="/bills/:billNumber" element={<Bills />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/committees" element={<Committees2 />} />
              <Route path="/committees/:committeeSlug" element={<Committees />} />
              <Route path="/members" element={<Members2 />} />
              <Route path="/members/:memberSlug" element={<Members />} />
              <Route path="/problems" element={<Problems />} />
              <Route path="/problems/:problemSlug" element={<ProblemPage />} />
              <Route path="/laws" element={<LawsClean />} />
              <Route path="/laws/admin" element={<LawsAdminWorking />} />
              <Route path="/laws/admin-full" element={<LawsAdmin />} />
              <Route path="/laws/test" element={<LawsTest />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/changelog" element={<ChangeLog />} />
              <Route path="/about" element={<About />} />
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
            <BrowserRouter>
              <ScrollToTop />
              <CommandPalette />
              <PageTransition>
                <Routes>
            <Route path="/" element={<NewChat />} />                  <Route path="/alt" element={<Landing />} />
                              <Route path="/features" element={<LandingPageWaitlist />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-2" element={<Auth2 />} />
                  <Route path="/free-trial" element={<FreeTrial />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/constitution" element={<Constitution />} />
                  <Route path="/digital-bill-of-rights" element={<DigitalBillOfRights />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/ai-fluency" element={<AIFluency />} />
                  <Route path="/use-cases/bills" element={<UseCasesBills />} />
                  <Route path="/use-cases/committees" element={<UseCasesCommittees />} />
                  <Route path="/use-cases/members" element={<UseCasesMembers />} />
                  <Route path="/use-cases/policy" element={<UseCasesPolicy />} />
                  <Route path="/nonprofits/economic-advocacy" element={<NonprofitEconomicAdvocacy />} />
                  <Route path="/nonprofits/environmental-advocacy" element={<NonprofitEnvironmentalAdvocacy />} />
                  <Route path="/nonprofits/legal-advocacy" element={<NonprofitLegalAdvocacy />} />
                  <Route path="/nonprofits/social-advocacy" element={<NonprofitSocialAdvocacy />} />
                  <Route path="/nonprofits/directory" element={<NonprofitDirectory />} />
                  <Route path="/problems/:problemSlug" element={<ProblemPage />} />
                  <Route path="*" element={<AppLayout />} />
                </Routes>
              </PageTransition>
            </BrowserRouter>
          </ModelProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
