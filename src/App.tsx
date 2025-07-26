import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from '@vercel/speed-insights/react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModelProvider, useModel } from "@/contexts/ModelContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ModelSelector } from "@/components/ModelSelector";
import { HeartSidebarTrigger } from "@/components/HeartSidebarTrigger";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ScrollProgress } from "@/components/magicui/scroll-progress";
import Landing from "./pages/Landing";
import Landing2 from "./pages/Landing-2";
import Home from "./pages/Home";
import Index from "./pages/Index";
import { Auth } from "./pages/Auth";
import Profile from "./pages/Profile";
import Bills from "./pages/Bills";
import Members from "./pages/Members";
import Committees from "./pages/Committees";
import Chats from "./pages/Chats";
import Favorites from "./pages/Favorites";
import Playground from "./pages/Playground";
import PolicyPortal from "./pages/PolicyPortal";
import Plans from "./pages/Plans";
import ChangeLog from "./pages/ChangeLog";
import ProblemPage from "./pages/ProblemPage";
import Problems from "./pages/Problems";
import Features from "./pages/Features";
import About from "./pages/About";
import PublicPolicy from "./pages/PublicPolicy";
import StyleGuide from "./pages/StyleGuide";
import Admin from "./pages/Admin";
import FeedPage from "./pages/FeedPage";
import ImageUploadTest from "./pages/ImageUploadTest";

const queryClient = new QueryClient();

const AppLayout = () => {
  const { selectedModel, setSelectedModel } = useModel();
  
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <ScrollProgress className="top-0" />
            <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/80 backdrop-blur-md backdrop-saturate-150 supports-[backdrop-filter]:bg-background/60">
              <HeartSidebarTrigger />
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <ModelSelector 
                  selectedModel={selectedModel}
                  onModelChange={setSelectedModel}
                />
              </div>
            </header>
            <main className="flex-1">
              <Routes>
                <Route path="/home" element={<Home />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/playground" element={<Playground />} />
                <Route path="/policy-portal" element={<PolicyPortal />} />
                <Route path="/bills" element={<Bills />} />
                <Route path="/members" element={<Members />} />
                <Route path="/problems" element={<Problems />} />
                <Route path="/problems/:problemSlug" element={<ProblemPage />} />
                <Route path="/committees" element={<Committees />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/changelog" element={<ChangeLog />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about" element={<About />} />
                <Route path="/public-policy" element={<PublicPolicy />} />
                <Route path="/style-guide" element={<StyleGuide />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/dashboard" element={<Index />} />
                <Route path="/feed" element={<FeedPage />} />
                <Route path="/image-upload-test" element={<ImageUploadTest />} />
              </Routes>
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
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing2 />} />
                <Route path="/alt" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="*" element={<AppLayout />} />
              </Routes>
            </BrowserRouter>
          </ModelProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;