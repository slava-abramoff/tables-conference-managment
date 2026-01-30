import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import ConferenceForm from "./pages/ConferenceForm";
import Schedule from "./pages/Schedule";
import Lectures from "./pages/Lectures";
import Meets from "./pages/Meets";
import Users from "./pages/Users";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <Layout>
              <ConferenceForm />
            </Layout>
          }
        />
        <Route
          path="/schedule"
          element={
            <Layout>
              <Schedule />
            </Layout>
          }
        />
        <Route
          path="/lectures"
          element={
            <Layout>
              <Lectures />
            </Layout>
          }
        />
        <Route
          path="/meets"
          element={
            <Layout>
              <Meets />
            </Layout>
          }
        />
        <Route
          path="/users"
          element={
            <Layout>
              <Users />
            </Layout>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
