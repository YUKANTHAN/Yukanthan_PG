import { useEffect, useState } from "react";
import type { ElementType } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingContext";

import MarqueeModule from "react-fast-marquee";

const Marquee = (MarqueeModule as unknown as { default?: ElementType })
  .default ?? MarqueeModule;

const translations = [
  "யுகாந்தன்",
  "Yukanthan",
  "യുകൻ",
  "ಯುಕನ್",
  "యుకన్",
  "ユーカンタン",
  "युकान्तन",
  "যুকান্থন",
  "યુકન્થન",
  "ਯੂਕਾਂਥਨ",
  "يوكانثان",
  "尤坎坦",
  "Юкантан"
];

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [langIndex, setLangIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setLangIndex((prev) => (prev + 1) % translations.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (percent >= 100) {
    setTimeout(() => {
      setLoaded(true);
      setTimeout(() => {
        setIsLoaded(true);
      }, 1000);
    }, 600);
  }

  useEffect(() => {
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true);
        setTimeout(() => {
          if (module.initialFX) {
            module.initialFX();
          }
          setIsLoading(false);
        }, 900);
      }
    });
  }, [isLoaded, setIsLoading]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <span className="loader-title" data-cursor="disable" onMouseDown={(e) => e.preventDefault()} draggable={false}>
          {translations[langIndex]}
        </span>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        <div className="loading-marquee">
          <Marquee>
            <span>&nbsp; AI Engineer &nbsp;</span> <span>&nbsp; Full Stack Developer &nbsp;</span>
            <span>&nbsp; AI Engineer &nbsp;</span> <span>&nbsp; Full Stack Developer &nbsp;</span>
          </Marquee>
        </div>
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

