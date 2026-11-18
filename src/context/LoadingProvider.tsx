import { PropsWithChildren, useEffect, useState } from "react";
import Loading from "../components/Loading";
import { LoadingContext } from "./LoadingContext";

const SKIP_LOADING_KEY = "yukanthan_skip_loading";

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(() => {
    if (window.location.pathname !== "/") return false;
    if (window.innerWidth <= 768) return false;
    if (typeof window !== "undefined" && localStorage.getItem(SKIP_LOADING_KEY)) return false;
    return true;
  });
  const [loading, setLoading] = useState(0);

  const value = {
    isLoading,
    setIsLoading,
    setLoading,
  };
  useEffect(() => {
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

  return (
    <LoadingContext.Provider value={value}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

