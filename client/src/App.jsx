import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import HospitalRegister from './pages/HospitalRegister';

// Layout
import Layout from './components/Layout';

// Role-Based Dashboards
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import NurseDashboard from './pages/NurseDashboard';
import LabDashboard from './pages/LabDashboard';
import PharmacyDashboard from './pages/PharmacyDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Shared Clinical Pages (protected, multiple roles)
import RegisterMother from './pages/RegisterMother';
import PatientSearch from './pages/PatientSearch';
import PatientProfile from './pages/PatientProfile';
import Reports from './pages/Reports';
import PregnancyTracker from './pages/PregnancyTracker';
import DeliveryForm from './pages/DeliveryForm';
import BabyProfile from './pages/BabyProfile';
import GuardianPortal from './pages/GuardianPortal';
import ConsentLog from './pages/ConsentLog';
import AdminPanel from './pages/AdminPanel';
import SuperAdminPanel from './pages/SuperAdminPanel';

// All staff roles
const ALL_STAFF = ['superadmin', 'admin', 'receptionist', 'doctor', 'nurse', 'lab', 'pharmacy'];

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/book" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hospital-register" element={<HospitalRegister />} />

          {/* ── Guardian (Mother/Patient) Portal ── */}
          <Route path="/portal" element={<GuardianPortal />} />
          <Route path="/my-health" element={<GuardianPortal />} />

          {/* ── Staff Portal ── (all routes inside Layout require auth) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={ALL_STAFF}>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* ── Role-Specific Dashboards ── */}
            <Route
              path="/dashboard/receptionist"
              element={
                <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/doctor"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/nurse"
              element={
                <ProtectedRoute allowedRoles={['admin', 'nurse']}>
                  <NurseDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/lab"
              element={
                <ProtectedRoute allowedRoles={['admin', 'lab']}>
                  <LabDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/pharmacy"
              element={
                <ProtectedRoute allowedRoles={['admin', 'pharmacy']}>
                  <PharmacyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Legacy /dashboard → redirect handled by ProtectedRoute */}
            <Route path="/dashboard" element={<Navigate to="/dashboard/receptionist" replace />} />

            {/* ── Shared Clinical Routes ── */}
            <Route
              path="/patients/register"
              element={
                <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                  <RegisterMother />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/search"
              element={
                <ProtectedRoute allowedRoles={['admin', 'receptionist', 'doctor', 'nurse', 'lab', 'pharmacy']}>
                  <PatientSearch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <ProtectedRoute allowedRoles={ALL_STAFF}>
                  <PatientProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse', 'lab']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/pregnancy"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                  <PregnancyTracker />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/pregnancy/delivery"
              element={
                <ProtectedRoute allowedRoles={['admin', 'doctor', 'nurse']}>
                  <DeliveryForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patients/:id/consent"
              element={
                <ProtectedRoute allowedRoles={['admin', 'receptionist']}>
                  <ConsentLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/babies/:babyId"
              element={
                <ProtectedRoute allowedRoles={ALL_STAFF}>
                  <BabyProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['superadmin']}>
                  <SuperAdminPanel />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all: 404 → landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
