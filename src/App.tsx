import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import Wallpapers from "./pages/Wallpapers";
import Categories from "./pages/Categories";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Watch from "./pages/Watch";
import Favourites from "./pages/Favourites";
import Profile from "./pages/Profile";
import TestProfile from "./pages/TestProfile";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import DMCA from "./pages/DMCA";
import CopyrightPolicy from "./pages/CopyrightPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TranslationProvider>
          <AuthProvider>
            <SearchProvider>
              <Routes>
              <Route path="/" element={<Wallpapers />} />
              <Route path="/wallpapers" element={<Wallpapers />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/search" element={<Search />} />
              <Route path="/favourites" element={<Favourites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/test-profile" element={<TestProfile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/watch/:id" element={<Watch />} />
              <Route path="/about" element={<About />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/dmca" element={<DMCA />} />
              <Route path="/copyright-policy" element={<CopyrightPolicy />} />
              <Route path="/terms-of-use" element={<TermsOfUse />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </SearchProvider>
          </AuthProvider>
        </TranslationProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;