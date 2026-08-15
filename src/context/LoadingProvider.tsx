import { PropsWithChildren, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { LoadingContext } from "./LoadingContext";

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    // Skip loading on mobile
    if (window.innerWidth <= 768) return false;
    return true;
  });
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
    // Auto-start animations on mobile since there's no 3D model
    if (window.innerWidth <= 768) {
      import("../components/utils/initialFX").then((module) => {
        if (module.initialFX) {
          setTimeout(() => {
            module.initialFX();
          }, 100);
        }
      });
    }
  }, []);

  useEffect(() => {}, [loading]);

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

