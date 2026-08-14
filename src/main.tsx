import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext.tsx";
import { installChunkErrorRecovery, cleanupStaleServiceWorkers } from "./lib/appRecovery";

installChunkErrorRecovery();
void cleanupStaleServiceWorkers();

createRoot(document.getElementById("root")!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);
