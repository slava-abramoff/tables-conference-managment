import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/route";
import { ModalProvider } from "./context/ModalContext";
import ModalManager from "./modals/ModalManager";
import { useEffect } from "react";
import useAuthStore from "./store/authStore";

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <ModalProvider>
          <AppRoutes />
          <ModalManager />
        </ModalProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
