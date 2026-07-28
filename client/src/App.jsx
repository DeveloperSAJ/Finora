import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import Transactions from './pages/Transactions/Transactions';
import Reports from './pages/Reports/Reports';
import Settings from './pages/Settings/Settings';
import Savings from './pages/Savings/Savings';
import Profile from './pages/Profile/Profile';

import Navbar from './components/Navbar/Navbar';
import Sidebar from './components/Sidebar/Sidebar';
import BottomNav from './components/BottomNav/BottomNav';
import Footer from './components/Footer/Footer';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-800 dark:text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Toaster position="top-right" richColors />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
                  {/* Desktop Sidebar */}
                  <Sidebar />

                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Navbar />
                    
                    {/* pb-24 = space for bottom nav on mobile */}
                    <main className="flex-1 overflow-auto p-4 md:p-6 pb-24 md:pb-6 bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/savings" element={<Savings />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                      <Footer className="mt-8 hidden md:block" />
                    </main>
                  </div>

                  {/* Mobile Bottom Navigation */}
                  <BottomNav />
                </div>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;