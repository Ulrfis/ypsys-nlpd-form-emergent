import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DebugProvider } from "@/context/DebugContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { CookieConsentProvider } from "@/context/CookieConsentContext";
import { FormFlow } from "@/components/FormFlow";
import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { CookieBanner } from "@/components/CookieBanner";
import { PostHogLoader } from "@/components/PostHogLoader";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <DebugProvider>
      <ThemeProvider defaultTheme="light" storageKey="nlpd-ypsys-theme">
        <CookieConsentProvider>
          <div className="App min-h-screen w-full max-w-[100vw] overflow-x-hidden">
            <BrowserRouter>
              <Routes>
                <Route path="/politique-confidentialite" element={<PrivacyPolicy />} />
                <Route path="/" element={<FormFlow />} />
                <Route path="*" element={<FormFlow />} />
              </Routes>
            </BrowserRouter>
            <PostHogLoader />
            <CookieBanner />
            <Toaster position="top-right" />
          </div>
        </CookieConsentProvider>
      </ThemeProvider>
    </DebugProvider>
  );
}

export default App;
