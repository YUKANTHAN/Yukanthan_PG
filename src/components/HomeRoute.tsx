import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { LoadingProvider } from "../context/LoadingProvider";
import ErrorBoundary from "./ErrorBoundary";
import { lenis } from "./Navbar";
import { initialFX, initialFXStarted } from "./utils/initialFX";

gsap.registerPlugin(ScrollTrigger);

const MainContainer = lazy(() => import("./MainContainer"));
const CharacterModel = lazy(() => import("./Character"));

const HomeRoute = () => {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  const isHomeRef = useRef(isHome);
  const lastScroll = useRef(0);
  const hasMounted = useRef(false);

  useLayoutEffect(() => {
    isHomeRef.current = isHome;
  }, [isHome]);

  useEffect(() => {
    const onScroll = () => {
      if (isHomeRef.current) lastScroll.current = window.scrollY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (isHome) {
      document.body.style.overflowY = "auto";
      if (!initialFXStarted) {
        initialFX();
      }
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        lenis?.resize();
        const y = lastScroll.current;
        if (lenis) {
          lenis.scrollTo(y, { immediate: true, force: true });
        } else {
          window.scrollTo(0, y);
        }
      });
    }
  }, [isHome]);

  return (
    <div className={`home-route${isHome ? "" : " hidden"}`}>
      <LoadingProvider>
        <ErrorBoundary>
          <Suspense fallback={null}>
            <MainContainer>
              <CharacterModel />
            </MainContainer>
          </Suspense>
        </ErrorBoundary>
      </LoadingProvider>
    </div>
  );
};

export default HomeRoute;