import { useState } from "react";
import "./App.css";
import { Header } from "./ui/header";
import { Sidebar } from "./ui/sidebar/Sidebar";
import { SidebarButton } from "./ui/buttons/SidebarButton/SidebarButton";

export const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header
        userName="Alex"
        isAuthenticated={false}
        onBurgerClick={() => setSidebarOpen(true)}
        onLoginClick={() => console.log("Login")}
      />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
        <SidebarButton
          text="Конференции"
          active
          onClick={() => console.log("/dashboard")}
        />
        <SidebarButton
          text="Лекции"
          onClick={() => console.log("/dashboard")}
        />
        <SidebarButton
          text="Пользователи"
          onClick={() => console.log("/dashboard")}
        />
      </Sidebar>
    </>
  );
};

export default App;
