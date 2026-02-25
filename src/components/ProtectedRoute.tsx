import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute() {
  const { session, loading, initialize, initialized } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Only show loader if we are truly loading AND not initialized yet
  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  if (!session && !loading) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
