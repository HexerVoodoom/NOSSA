import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthGate } from "./components/AuthGate.tsx";
import "./index.css";

const container = document.getElementById("root");

// `getElementById(...)!` só silenciava o typechecker: se o elemento não existir,
// createRoot(null) estoura um erro opaco e a tela fica branca sem explicação.
if (!container) {
  throw new Error('Elemento #root não encontrado no HTML — a aplicação não pôde ser montada.');
}

createRoot(container).render(
  <StrictMode>
    <AuthGate>
      <App />
    </AuthGate>
  </StrictMode>
);
