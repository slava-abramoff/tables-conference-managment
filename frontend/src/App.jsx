import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/route";
import { ModalProvider } from "./context/ModalContext";
import ModalManager from "./modals/ModalManager";

function App() {
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
