import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Revision from './pages/Revision';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 antialiased">
          <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.1),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(3,7,18,1))]" />
          <Navigation />
          <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-20 sm:px-6 sm:pb-32 sm:pt-24 lg:px-8 lg:pb-12 lg:pt-28">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
              <Route path="/revision" element={<ProtectedRoute><Revision /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
