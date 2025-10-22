import './index.css';
import React from "react";
import ReactDOM from "react-dom/client";  // Utilisation de la nouvelle API React 18
import { App } from "./App";

const root = ReactDOM.createRoot(document.getElementById("root")!);  // Utilisation de createRoot
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
