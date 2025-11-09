import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Scraper from "./pages/Scraper";
import Suppliers from "./pages/Suppliers";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/scraper" element={<Scraper />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/pixi" element={<div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Pixi Integration - Coming Soon</h1></div>} />
          <Route path="/products" element={<div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Produktverwaltung - Coming Soon</h1></div>} />
          <Route path="/export" element={<div className="container mx-auto px-4 py-8"><h1 className="text-4xl font-bold">Export & Import - Coming Soon</h1></div>} />
          <Route path="/suppliers" element={<Suppliers />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
