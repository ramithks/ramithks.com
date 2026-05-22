import { Routes, Route, Navigate } from "react-router-dom";
import { PersonalHub } from "./pages/me/PersonalHub";
import { PortfolioPage } from "./pages/portfolio/PortfolioPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AppOpener } from "./pages/me/AppOpener";
import { ShortLinkRedirect } from "./pages/me/ShortLinkRedirect";

function App() {
  return (
    <Routes>
      <Route path="/" element={<PersonalHub />} />
      <Route path="/me" element={<PersonalHub />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/open" element={<AppOpener />} />
      <Route path="/l/:slug" element={<ShortLinkRedirect />} />
      {/* Catch-all fallback redirects back to the main hub */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
