import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import App from "./App";
import AuthProvider from "./context/AuthProvider";
import "./index.css";
import ThemeProvider from "./context/ThemeProvider.jsx";
import { initializeTheme } from "./lib/theme.js";

const initialTheme = initializeTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider initialTheme={initialTheme}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--color-base-200)",
                color: "var(--color-base-content)",
                minWidth: "250px",
              },
              error: { duration: 3000 },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
