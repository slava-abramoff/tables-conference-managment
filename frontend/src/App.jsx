import { ThemeProvider } from "@mui/material/styles";
import theme from "./assets/styles/theme";
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./router/route";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
