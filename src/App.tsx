import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense, lazy, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from "@/store/auth";

// Eager load layout components
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy load pages for performance
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const CreateMemory = lazy(() => import("@/pages/CreateMemory"));
const MemoryDetail = lazy(() => import("@/pages/MemoryDetail"));
const PublicMemory = lazy(() => import("@/pages/PublicMemory"));
const Home = lazy(() => import("@/pages/Home"));
const Weddings = lazy(() => import("@/pages/landing/Weddings"));

// Configure QueryClient with better defaults to avoid loops
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Don't retry infinitely
      refetchOnWindowFocus: false, // Don't refetch when clicking back to window
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="animate-spin h-8 w-8 text-black" />
  </div>
);

export default function App() {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/weddings" element={<Weddings />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/share/:token" element={<PublicMemory />} />
            
            {/* Protected Routes */}
            <Route path="/app" element={<ProtectedRoute />}>
              <Route path="memories/:id" element={<MemoryDetail />} />
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="memories/new" element={<CreateMemory />} />
                {/* Add more protected routes here */}
              </Route>
            </Route>

            {/* Root redirect removed, handled by explicit route */}
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </QueryClientProvider>
  );
}
