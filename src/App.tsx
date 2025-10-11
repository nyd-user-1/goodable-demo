import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from '@vercel/analytics/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModelProvider } from "@/contexts/ModelContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { HeartSidebarTrigger } from "@/components/HeartSidebarTrigger";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import { PageTransition } from "@/components/PageTransition";
import { CommandPalette } from "@/components/CommandPalette";
import { ScrollToTop } from "@/components/ScrollToTop";
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
import Favorites from "./pages/Favorites";
import Playground from "./pages/Playground";
import PolicyPortal from "./pages/PolicyPortal";
import PolicyLab from "./pages/PolicyLab";
import Plans from "./pages/Plans";
import ChangeLog from "./pages/ChangeLog";
import ProblemPage from "./pages/ProblemPage";
import Problems from "./pages/Problems";
import About from "./pages/About";
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

const queryClient = new QueryClient();

const AppLayout = () => {
  return (
    <ProtectedRoute>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <ScrollProgress className="top-0" />
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 px-4 bg-background/80 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
              <HeartSidebarTrigger />
            </header>
            <main className="flex-1 overflow-hidden">
              <PageTransition>
                <Routes>
                  <Route path="/home" element={<Home />} />
                  <Route path="/home-2" element={<Home2 />} />
                  <Route path="/chats" element={<Chats />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/playground" element={<Playground />} />
                  <Route path="/policy-portal" element={<PolicyPortal />} />
                  <Route path="/policy-lab" element={<PolicyLab />} />
                  <Route path="/bills" element={<Bills />} />
                  <Route path="/members" element={<Members />} />
                  <Route path="/problems" element={<Problems />} />
                  <Route path="/problems/:problemSlug" element={<ProblemPage />} />
                  <Route path="/committees" element={<Committees />} />
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
            </main>
          </SidebarInset>
        </div>
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
                  <Route path="/" element={<LandingPageWaitlist />} />
                  <Route path="/alt" element={<Landing />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth-2" element={<Auth2 />} />
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