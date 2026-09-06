import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "../css/variables.css";
import "../css/base.css";
import "../css/components.css";
import "../css/header-footer.css";
import "../css/pages.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
