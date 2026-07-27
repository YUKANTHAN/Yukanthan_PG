import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import "./App.css";
import ErrorBoundary from "./components/ErrorBoundary";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const MyWorks = lazy(() => import("./pages/MyWorks"));
const Play = lazy(() => import("./pages/Play"));
import { LoadingProvider } from "./context/LoadingProvider";

const App = () => {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Routes>
        <Route
          path="/"
          element={
            <LoadingProvider>
              <ErrorBoundary>
                <Suspense>
                  <MainContainer>
                    <CharacterModel />
                  </MainContainer>
                </Suspense>
              </ErrorBoundary>
            </LoadingProvider>
          }
        />
        <Route
          path="/myworks"
          element={
            <ErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <MyWorks />
              </Suspense>
            </ErrorBoundary>
          }
        />
        <Route
          path="/play"
          element={
            <ErrorBoundary>
              <Suspense fallback={<div>Loading...</div>}>
                <Play />
              </Suspense>
            </ErrorBoundary>
          }
        />
      </Routes>
      <Analytics />
      <SpeedInsights />
    </BrowserRouter>
  );
};

export default App;
