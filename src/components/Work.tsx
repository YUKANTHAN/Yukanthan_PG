import { useEffect, useRef } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const flexRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDesktop = window.innerWidth > 768;
    let tl: gsap.core.Timeline | null = null;

    function setTranslateX() {
      const boxes = document.querySelectorAll<HTMLElement>(".work-box");
      const container = document.querySelector<HTMLElement>(".work-container");
      const flex = document.querySelector<HTMLElement>(".work-flex");
      if (!boxes.length || !container || !flex) return;

      const boxWidth = boxes[0].offsetWidth;
      const marginLeft = parseFloat(getComputedStyle(flex).marginLeft) || 0;
      return boxWidth * boxes.length + marginLeft - container.clientWidth;
    }

    function createTimeline() {
      if (tl) {
        tl.kill();
        ScrollTrigger.getById("work")?.kill();
      }

      if (isDesktop) {
        // Desktop: horizontal pinned scroll
        const translateX = setTranslateX();
        if (translateX === undefined) return;

        tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".work-section",
            start: "top top",
            end: `+=${translateX}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            id: "work",
            invalidateOnRefresh: true,
          },
        });
        tl.to(".work-flex", {
          x: -translateX,
          ease: "none",
        });
      } else {
        // Mobile: horizontal scroll with CSS snap (no GSAP pin needed)
        // Universal design enhancements for mobile carousel
        const flex = flexRef.current;
        if (!flex) return;

        // Keyboard navigation
        const handleKeyDown = (e: KeyboardEvent) => {
          const cards = flex.querySelectorAll<HTMLElement>(".work-box");
          const activeIdx = Array.from(cards).findIndex((c) =>
            c.matches(":focus, :focus-within")
          );
          if (activeIdx === -1) return;

          let nextIdx = activeIdx;
          if (e.key === "ArrowRight") nextIdx = Math.min(activeIdx + 1, cards.length - 1);
          else if (e.key === "ArrowLeft") nextIdx = Math.max(activeIdx - 1, 0);
          else if (e.key === "Home") nextIdx = 0;
          else if (e.key === "End") nextIdx = cards.length - 1;
          else return;

          e.preventDefault();
          cards[nextIdx]?.focus();
          cards[nextIdx]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        };

        flex.addEventListener("keydown", handleKeyDown);

        // Scroll indicators: fade edges when not at boundaries
        const updateEdgeFade = () => {
          const { scrollLeft, scrollWidth, clientWidth } = flex;
          const atStart = scrollLeft <= 4;
          const atEnd = scrollLeft + clientWidth >= scrollWidth - 4;
          flex.style.setProperty("--fade-start", atStart ? "0" : "1");
          flex.style.setProperty("--fade-end", atEnd ? "0" : "1");
        };
        flex.addEventListener("scroll", updateEdgeFade, { passive: true });
        updateEdgeFade();

        return () => {
          flex.removeEventListener("keydown", handleKeyDown);
          flex.removeEventListener("scroll", updateEdgeFade);
        };
      }

      ScrollTrigger.refresh();
    }

    createTimeline();

    let resizeTimeout: number;
    let lastIsDesktop = isDesktop;
    const handleResize = () => {
      const nowDesktop = window.innerWidth > 768;
      if (nowDesktop === lastIsDesktop) return;
      lastIsDesktop = nowDesktop;
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        createTimeline();
      }, 200);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      if (tl) {
        tl.kill();
        ScrollTrigger.getById("work")?.kill();
      }
    };
  }, []);

  return (
    <div className="work-section" id="work" data-cursor-section="bright">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div
          className="work-flex"
          ref={flexRef}
          role="region"
          aria-label="Projects"
          aria-roledescription="carousel"
        >
          {config.projects.slice(0, 5).map((project, index) => {
            const projectUrl = 'demoLink' in project && project.demoLink ? project.demoLink : project.link;
            return (
              <div className="work-box" key={project.id} tabIndex={0}>
                <div className="work-info">
                  <div className="work-title">
                    <h3>0{index + 1}</h3>

                    <div>
                      <h4>{project.title}</h4>
                      <p>{project.category}</p>
                    </div>
                  </div>
                  <h4>Tools and features</h4>
                  <p>{project.technologies}</p>
                </div>
                <WorkImage image={project.image} alt={project.title} link={projectUrl} />
              </div>
            );
          })}
          {/* See All Works Button */}
          <div className="work-box work-box-cta" tabIndex={0}>
            <div className="see-all-works">
              <h3>Want to see more?</h3>
              <p>Explore all of my projects and creations</p>
              <Link to="/myworks" className="see-all-btn" data-cursor="disable">
                See All Works →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Work;
