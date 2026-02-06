
import {
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { axiosClient } from "./api/axiosClient";

import LoginPage from "./components/LoginPage";
import Sidebar from "./components/Sidebar";
//import Dashboard from "./components/Dashboard";

import TicketManagement from "./components/TicketManagement";
import Settings from "./components/Settings";

import SelectUnitPage from "./components/SelectUnitPage";



import Register from "./components/Register";
import EquipmentPage from "./components/EquipmentPage";

import MyTickets from "./components/MyTickets";


/* -------------------------------- Protected Route --------------------------- */
function ProtectedRoute({
  isAuthed,
  children,
}: {
  isAuthed: boolean;
  children: JSX.Element;
}) {
  if (!isAuthed) return <Navigate to="/" replace />;
  return children;
}

/* -------------------------------- UNIT LAYOUT --------------------------- */
function UnitLayout({ onLogout, user }: { onLogout: () => void; user: any }) {


  return (
    <>
      <Sidebar onLogout={onLogout} user={user} />
      <div className="ml-[280px] w-[calc(100%-280px)]">
        <Outlet />
      </div>
    </>
  );
}

/* -------------------------------- MAIN APP --------------------------- */
function App() {
  const { user: loggedUser, loading } = useAuth();
  const isAuthenticated = !!loggedUser;

  /* ------------------------------ LOGIN ------------------------------ */
  const handleLogin = (user: any) => {
    // Cookie is already set by backend, just navigate and reload
    if (user.role === "admin") {
      window.location.href = "/select-unit";
      return;
    }

    if (!user.unitId) {
      alert("Employee has no assigned unit!");
      return;
    }

    window.location.href = `/unit/${user.unitId}/tickets`;
  };

  /* ------------------------------ LOGOUT ------------------------------ */
  const handleLogout = async () => {
    try {
      await axiosClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    window.location.href = "/";
  };



  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-slate-700 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* SELECT UNIT */}
        <Route
          path="/select-unit"
          element={
            <ProtectedRoute isAuthed={isAuthenticated}>
              <SelectUnitPage />
            </ProtectedRoute>
          }
        />

        {/* UNIT ROUTES */}
        <Route
          path="/unit/:unitId"
          element={
            <ProtectedRoute isAuthed={isAuthenticated}>
              <UnitLayout onLogout={handleLogout} user={loggedUser} />
            </ProtectedRoute>
          }
        >
          {/* <Route
      path="dashboard"
      element={
        <Dashboard
          hospital={hospitalInfo}
          equipments={equipments}
        />
      }
    /> */}

          {/* ✅ ADMIN ONLY */}
          <Route
            path="equipments"
            element={
              <EquipmentPage />
            }
          />

          <Route
            path="tickets"
            element={<TicketManagement />}
          />

          <Route
            path="review"
            element={<MyTickets />}
          />
          {/* 
    <Route
      path="my-tickets"
      element={<MyTickets />}
    /> */}

          <Route path="settings" element={<Settings />} />

        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>


    </div>
  );
}

export default App;
