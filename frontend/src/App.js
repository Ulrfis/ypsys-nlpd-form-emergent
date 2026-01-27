import "@/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { FormFlow } from "@/components/FormFlow";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="nlpd-ypsys-theme">
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<FormFlow />} />
            <Route path="*" element={<FormFlow />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </div>
    </ThemeProvider>
  );
}

export default App;
