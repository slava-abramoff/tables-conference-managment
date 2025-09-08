import { Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Users from "../pages/Users/Users";
import Meets from "../pages/Meets/Meets";
import Lectures from "../pages/Lectures/Lectures";
import Schedule from "../pages/Schedule/Schedule";
import Form from "../pages/Form/Form";

import NotFound from "../pages/NotFound/NotFound";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/users" element={<Users />} />
      <Route path="/meets" element={<Meets />} />
      <Route path="/lectures" element={<Lectures />} />
      <Route path="/schedule" element={<Schedule />} />
      <Route path="/form" element={<Form />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;
