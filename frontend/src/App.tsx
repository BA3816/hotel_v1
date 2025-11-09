import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import VisitorProtectedRoute from './components/VisitorProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Rooms from './pages/Rooms';
import Offers from './pages/Offers';
import Activities from './pages/Activities';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';

// Visitor Pages
import VisitorLogin from './pages/VisitorLogin';
import VisitorRegister from './pages/VisitorRegister';
import VisitorDashboard from './pages/VisitorDashboard';
import VisitorForgotPassword from './pages/VisitorForgotPassword';
import VisitorResetPassword from './pages/VisitorResetPassword';

// Admin Pages
import AdminLogin from './pages/admin/adminLogin';
import AdminRegister from './pages/admin/AdminRegister';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';
import AdminGuests from './pages/admin/AdminGuests';
import AdminActivities from './pages/admin/AdminActivities';
import AdminOffers from './pages/admin/AdminOffers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminSettings from './pages/admin/AdminSettings';
import AdminRoomAvailability from './pages/admin/AdminRoomAvailability';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/blog" element={<Blog />} />

        {/* Visitor Routes */}
        <Route path="/visitor/login" element={<VisitorLogin />} />
        <Route path="/visitor/register" element={<VisitorRegister />} />
        <Route path="/visitor/forgot-password" element={<VisitorForgotPassword />} />
        <Route path="/visitor/reset-password" element={<VisitorResetPassword />} />
        <Route
          path="/visitor/dashboard"
          element={
            <VisitorProtectedRoute>
              <VisitorDashboard />
            </VisitorProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/login" element={<AdminLogin />} />
        <Route path="/register" element={<AdminRegister />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminRooms />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bookings"
          element={
            <ProtectedRoute>
              <AdminBookings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/guests"
          element={
            <ProtectedRoute>
              <AdminGuests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/activities"
          element={
            <ProtectedRoute>
              <AdminActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/offers"
          element={
            <ProtectedRoute>
              <AdminOffers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <ProtectedRoute>
              <AdminPayments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/room-availability"
          element={
            <ProtectedRoute>
              <AdminRoomAvailability />
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

