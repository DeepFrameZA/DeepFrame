import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./core/AuthContext";
import { HouseProvider } from "./core/HouseContext";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <HouseProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "var(--color-base-100)",
                color: "var(--color-base-content)",
                minWidth: "250px",
              },
              error: { duration: 5000 },
            }}
          />
        </HouseProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
