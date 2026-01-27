import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider, useAuth } from "@/lib/auth";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import TravelerDashboard from "./pages/dashboard/TravelerDashboard";
import ProviderDashboard from "./pages/dashboard/ProviderDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";
import BeneficiariesPage from "./pages/beneficiaries/BeneficiariesPage";
import NewBookingPage from "./pages/bookings/NewBookingPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import KycPage from "./pages/provider/KycPage";
import ServicesPage from "./pages/provider/ServicesPage";
import KycQueuePage from "./pages/admin/KycQueuePage";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to appropriate dashboard based on role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'provider') return <Navigate to="/provider" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Dashboard Router - redirects to appropriate dashboard based on role
function DashboardRouter() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (role === 'admin') return <Navigate to="/admin" replace />;
  if (role === 'provider') return <Navigate to="/provider" replace />;
  return <TravelerDashboard />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      {/* Protected Routes - Dashboard Router */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      
      {/* Beneficiaries Routes */}
      <Route
        path="/beneficiaries"
        element={
          <ProtectedRoute>
            <BeneficiariesPage />
          </ProtectedRoute>
        }
      />
      
      {/* Booking Routes */}
      <Route
        path="/bookings"
        element={
          <ProtectedRoute>
            <BookingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bookings/new"
        element={
          <ProtectedRoute>
            <NewBookingPage />
          </ProtectedRoute>
        }
      />
      
      {/* Provider Routes */}
      <Route
        path="/provider"
        element={
          <ProtectedRoute allowedRoles={['provider', 'admin']}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/kyc"
        element={
          <ProtectedRoute allowedRoles={['provider', 'admin']}>
            <KycPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/services"
        element={
          <ProtectedRoute allowedRoles={['provider', 'admin']}>
            <ServicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/provider/*"
        element={
          <ProtectedRoute allowedRoles={['provider', 'admin']}>
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/kyc"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <KycQueuePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
