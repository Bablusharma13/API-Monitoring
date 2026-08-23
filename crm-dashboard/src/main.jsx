import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { initTheme } from "./theme/theme.js";
import { ThemeProvider } from "./theme/ThemeContext.jsx";

axios.defaults.withCredentials = true;

initTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
