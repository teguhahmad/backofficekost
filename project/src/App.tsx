import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import BackofficeLayout from './components/layout/BackofficeLayout';
import Login from './pages/Login';
import BackofficeDashboard from './pages/backoffice/Dashboard';
import BackofficeUsers from './pages/backoffice/Users';
import BackofficeNotifications from './pages/backoffice/Notifications';
import BackofficeProperties from './pages/backoffice/Properties';
import BackofficeSubscriptionPlans from './pages/backoffice/SubscriptionPlans';
import BackofficeSubscriptions from './pages/backoffice/Subscriptions';
import RolePermissions from './pages/backoffice/RolePermissions';
import BackofficeSettings from './pages/backoffice/Settings';
import { supabase } from './lib/supabase';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (!session) {
        navigate('/login');
        return;
      }

      // Check if user has backoffice access
      const { data: backofficeUser, error } = await supabase
        .from('backoffice_users')
        .select('role')
        .eq('user_id', session.user.id)
        .single();

      if (error || !backofficeUser) {
        setIsAuthorized(false);
        navigate('/login');
        return;
      }

      setIsAuthorized(true);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        navigate('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isAuthenticated === null || isAuthorized === null) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated || !isAuthorized) {
    return null;
  }

  return <>{children}</>;
};

const BackofficeContent: React.FC = () => {
  return (
    <BackofficeLayout>
      <Routes>
        <Route path="/" element={<BackofficeDashboard />} />
        <Route path="/users" element={<BackofficeUsers />} />
        <Route path="/notifications" element={<BackofficeNotifications />} />
        <Route path="/properties" element={<BackofficeProperties />} />
        <Route path="/subscriptions" element={<BackofficeSubscriptions />} />
        <Route path="/subscription-plans" element={<BackofficeSubscriptionPlans />} />
        <Route path="/role-permissions" element={<RolePermissions />} />
        <Route path="/settings" element={<BackofficeSettings />} />
      </Routes>
    </BackofficeLayout>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <BackofficeContent />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

export default App;