import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import Users from "../pages/Users/Users";
import Meets from "../pages/Meets/Meets";
import Lectures from "../pages/Lectures/Lectures";
import Schedule from "../pages/Schedule/Schedule";
import Form from "../pages/Form/Form";
import NotFound from "../pages/NotFound/NotFound";
import useAuthStore from "../store/authStore";

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore();
  return isAuthenticated && user?.role === "admin" ? (
    children
  ) : (
    <Navigate to="/login" />
  );
}

function LoginRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/schedule" /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginRoute>
            <Login />
          </LoginRoute>
        }
      />
      <Route
        path="/users"
        element={
          <AdminRoute>
            <Users />
          </AdminRoute>
        }
      />
      <Route
        path="/meets"
        element={
          <PrivateRoute>
            <Meets />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule/:date"
        element={
          <PrivateRoute>
            <Lectures />
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <PrivateRoute>
            <Schedule />
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Form />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
