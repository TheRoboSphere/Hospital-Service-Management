
import { useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,

  Outlet,
} from "react-router-dom";

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedUser, setLoggedUser] = useState<any>(null);



  const navigate = useNavigate();

  /* ------------------------------ LOGIN ------------------------------ */
  const handleLogin = (user: any) => {
    setIsAuthenticated(true);
    setLoggedUser(user);

    if (user.role === "admin") {
      navigate("/select-unit");
      return;
    }

    if (!user.unitId) {
      alert("Employee has no assigned unit!");
      return;
    }

    navigate(`/unit/${user.unitId}/tickets`);
  };

  /* ------------------------------ LOGOUT ------------------------------ */
  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoggedUser(null);
    navigate("/");
  };



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
