import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";

// route imports
import LoginPage from "./pages/Login/Login";
import Users from "./pages/Users/Users";
import Workorders from "./pages/WorkOrders/WorkOrders";
import OpenWorkorder from "./pages/OpenWorkorder/OpenWorkorder";

// local imports
import { useAuth } from "./auth/hooks/AuthContext";
import { usePermissions } from "./auth/hooks/usePermissions";
import Layout from "./components/PageLayout";

// components
function ProtectedRoute({ children, permission, permissions, requireAll }) {
  const { user, loading } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissions();

  console.log("ProtectedRoute user:", user);

  let hasAccess = true;

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
  }

  console.log("ProtectedRoute hasAccess:", hasAccess);

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return <Layout onLogout={() => {}}>{children}</Layout>;
}

/*         "afterImages": [
            "https://nfcaccountstorage.blob.core.windows.net/sarlacc/1764873153142_Image%205%20(24).jpeg?sv=2022-11-02&ss=b&srt=sco&sp=rwacitfx&se=2025-12-17T07:07:01Z&st=2024-12-16T23:07:01Z&spr=https,http&sig=UN%2B7OgHk2VN6uUlCxPnALsr6HAwjzRLYwHkY5ovZr7k%3D",
            "https://nfcaccountstorage.blob.core.windows.net/sarlacc/1764873154764_Image%206%20(18).jpeg?sv=2022-11-02&ss=b&srt=sco&sp=rwacitfx&se=2025-12-17T07:07:01Z&st=2024-12-16T23:07:01Z&spr=https,http&sig=UN%2B7OgHk2VN6uUlCxPnALsr6HAwjzRLYwHkY5ovZr7k%3D",
            "https://nfcaccountstorage.blob.core.windows.net/sarlacc/1764873156243_Image%204%20(35).jpeg?sv=2022-11-02&ss=b&srt=sco&sp=rwacitfx&se=2025-12-17T07:07:01Z&st=2024-12-16T23:07:01Z&spr=https,http&sig=UN%2B7OgHk2VN6uUlCxPnALsr6HAwjzRLYwHkY5ovZr7k%3D",
            "https://nfcaccountstorage.blob.core.windows.net/sarlacc/1764873157316_Image%203%20(39).jpeg?sv=2022-11-02&ss=b&srt=sco&sp=rwacitfx&se=2025-12-17T07:07:01Z&st=2024-12-16T23:07:01Z&spr=https,http&sig=UN%2B7OgHk2VN6uUlCxPnALsr6HAwjzRLYwHkY5ovZr7k%3D"
        ] */

function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route exact path="/" element={<Navigate to="/workorders" />} />

        <Route
          exact
          path="/users"
          element={
            <ProtectedRoute
              permissions={[
                "manage_employees",
                "manage_external_admins",
                "manage_internal_admins",
              ]}
            >
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          exact
          path="/workorders"
          element={
            <ProtectedRoute permission="view_work-orders">
              <Workorders />
            </ProtectedRoute>
          }
        />

        <Route
          exact
          path="/workorders/:id"
          element={
            <ProtectedRoute permission="view_work-orders">
              <OpenWorkorder />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
