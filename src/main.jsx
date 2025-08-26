import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import "./index.css";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
