import "@/index.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { DebugProvider } from "@/context/DebugContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { ConsentProvider, useConsent } from "@/context/ConsentContext";
import { FormFlow } from "@/components/FormFlow";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { ConsentPopup, CookiePreferencesButton } from "@/components/ConsentPopup";
import { Toaster } from "@/components/ui/sonner";
import { initAnalytics, trackPageView } from "@/lib/analytics";

function AnalyticsRouteTracker() {
  const location = useLocation();
  const { hasConsentedToAnalytics } = useConsent();

  useEffect(() => {
    if (!hasConsentedToAnalytics) return;
    trackPageView(location.pathname, location.search || "");
  }, [location.pathname, location.search, hasConsentedToAnalytics]);

  return null;
}

function AnalyticsInitializer() {
  const { hasConsentedToAnalytics } = useConsent();

  useEffect(() => {
    if (!hasConsentedToAnalytics) return;
    initAnalytics();
  }, [hasConsentedToAnalytics]);

  return null;
}

function App() {

  return (
    <ConsentProvider>
      <DebugProvider>
        <ThemeProvider defaultTheme="light" storageKey="nlpd-ypsys-theme">
          <div className="App min-h-screen w-full max-w-[100vw] overflow-x-hidden">
            <BrowserRouter>
              <AnalyticsInitializer />
              <AnalyticsRouteTracker />
              <Routes>
                <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
                <Route path="/" element={<FormFlow />} />
                <Route path="*" element={<FormFlow />} />
              </Routes>
              <ConsentPopup />
              <CookiePreferencesButton />
            </BrowserRouter>
            <Toaster position="top-right" />
          </div>
        </ThemeProvider>
      </DebugProvider>
    </ConsentProvider>
  );
}

export default App;
