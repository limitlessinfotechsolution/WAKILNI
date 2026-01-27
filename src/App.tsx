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
import VendorDashboard from "./pages/dashboard/VendorDashboard";
import DonatePage from "./pages/donate/DonatePage";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import NotFound from "./pages/NotFound";
import BeneficiariesPage from "./pages/beneficiaries/BeneficiariesPage";
import NewBookingPage from "./pages/bookings/NewBookingPage";
import BookingsPage from "./pages/bookings/BookingsPage";
import BookingDetailPage from "./pages/bookings/BookingDetailPage";
import KycPage from "./pages/provider/KycPage";
import ServicesPage from "./pages/provider/ServicesPage";
import ReviewsPage from "./pages/provider/ReviewsPage";
import KycQueuePage from "./pages/admin/KycQueuePage";
import UsersManagementPage from "./pages/admin/UsersManagementPage";
import VendorsManagementPage from "./pages/admin/VendorsManagementPage";
import ProvidersManagementPage from "./pages/admin/ProvidersManagementPage";
import DonationsPage from "./pages/admin/DonationsPage";
import BookingAllocationPage from "./pages/admin/BookingAllocationPage";
import SystemSettingsPage from "./pages/super-admin/SystemSettingsPage";
import AuditLogsPage from "./pages/super-admin/AuditLogsPage";
import AdminManagementPage from "./pages/super-admin/AdminManagementPage";
import VendorBookingsPage from "./pages/vendor/VendorBookingsPage";
import VendorServicesPage from "./pages/vendor/VendorServicesPage";
import VendorSubscriptionPage from "./pages/vendor/VendorSubscriptionPage";
import VendorKycPage from "./pages/vendor/VendorKycPage";

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
    if (role === 'super_admin' || role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'provider') return <Navigate to="/provider" replace />;
    if (role === 'vendor') return <Navigate to="/vendor" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Dashboard Router
function DashboardRouter() {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  switch (role) {
    case 'super_admin':
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'provider':
      return <Navigate to="/provider" replace />;
    case 'vendor':
      return <Navigate to="/vendor" replace />;
    default:
      return <TravelerDashboard />;
  }
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/donate" element={<DonatePage />} />
      
      {/* Dashboard Router */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      
      {/* Traveler Routes */}
      <Route path="/beneficiaries" element={<ProtectedRoute><BeneficiariesPage /></ProtectedRoute>} />
      <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
      <Route path="/bookings/new" element={<ProtectedRoute><NewBookingPage /></ProtectedRoute>} />
      <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
      
      {/* Provider Routes */}
      <Route path="/provider" element={<ProtectedRoute allowedRoles={['provider', 'admin', 'super_admin']}><ProviderDashboard /></ProtectedRoute>} />
      <Route path="/provider/kyc" element={<ProtectedRoute allowedRoles={['provider', 'admin', 'super_admin']}><KycPage /></ProtectedRoute>} />
      <Route path="/provider/services" element={<ProtectedRoute allowedRoles={['provider', 'admin', 'super_admin']}><ServicesPage /></ProtectedRoute>} />
      <Route path="/provider/reviews" element={<ProtectedRoute allowedRoles={['provider', 'admin', 'super_admin']}><ReviewsPage /></ProtectedRoute>} />
      
      {/* Vendor Routes */}
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor', 'admin', 'super_admin']}><VendorDashboard /></ProtectedRoute>} />
      <Route path="/vendor/kyc" element={<ProtectedRoute allowedRoles={['vendor', 'admin', 'super_admin']}><VendorKycPage /></ProtectedRoute>} />
      <Route path="/vendor/bookings" element={<ProtectedRoute allowedRoles={['vendor', 'admin', 'super_admin']}><VendorBookingsPage /></ProtectedRoute>} />
      <Route path="/vendor/services" element={<ProtectedRoute allowedRoles={['vendor', 'admin', 'super_admin']}><VendorServicesPage /></ProtectedRoute>} />
      <Route path="/vendor/subscription" element={<ProtectedRoute allowedRoles={['vendor', 'admin', 'super_admin']}><VendorSubscriptionPage /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><UsersManagementPage /></ProtectedRoute>} />
      <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><ProvidersManagementPage /></ProtectedRoute>} />
      <Route path="/admin/vendors" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><VendorsManagementPage /></ProtectedRoute>} />
      <Route path="/admin/kyc" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><KycQueuePage /></ProtectedRoute>} />
      <Route path="/admin/donations" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><DonationsPage /></ProtectedRoute>} />
      <Route path="/admin/allocations" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><BookingAllocationPage /></ProtectedRoute>} />
      
      {/* Super Admin Routes */}
      <Route path="/super-admin/settings" element={<ProtectedRoute allowedRoles={['super_admin']}><SystemSettingsPage /></ProtectedRoute>} />
      <Route path="/super-admin/audit" element={<ProtectedRoute allowedRoles={['super_admin']}><AuditLogsPage /></ProtectedRoute>} />
      <Route path="/super-admin/admins" element={<ProtectedRoute allowedRoles={['super_admin']}><AdminManagementPage /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
