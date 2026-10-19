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
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const setupMobileScroll = (flex: HTMLDivElement) => {
    const boxes = flex.querySelectorAll<HTMLElement>(".work-box");
    const container = flex.closest<HTMLElement>(".work-container");
    if (!boxes.length || !container) return;

    const boxWidth = boxes[0].offsetWidth;
    const gap = 16;
    const translateX = (boxes.length - 1) * (boxWidth + gap);
    const startOffset = (container.clientWidth - boxWidth) / 2;

    // Set initial centered position immediately (before ScrollTrigger)
    gsap.set(flex, { x: startOffset, overwrite: "auto" });

    // Kill existing
    if (timelineRef.current) timelineRef.current.kill();
    if (scrollTriggerRef.current) scrollTriggerRef.current.kill();

    // Create ScrollTrigger with pin
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: ".work-section",
      start: "top top",
      end: `+=${translateX}`,
      scrub: 1,
      pin: true,
      pinSpacing: true,
      anticipatePin: 1,
      id: "work",
      invalidateOnRefresh: true,
      onRefresh: (self) => {
        const spacer = document.querySelector(".pin-spacer") as HTMLElement;
        if (spacer) spacer.style.height = `${self.end - self.start}px`;
      },
    });

    // Animate from centered start to centered end
    timelineRef.current = gsap.timeline({
      scrollTrigger: { id: "work" },
    });
    timelineRef.current.to(flex, {
      x: startOffset - translateX,
      ease: "none",
      immediateRender: false,
    });
  };

  // Ref callback: runs synchronously when element mounts
  const handleFlexRef = (el: HTMLDivElement | null) => {
    if (!el) return;
    if (window.innerWidth <= 768) {
      // Small delay to ensure layout is settled
      requestAnimationFrame(() => setupMobileScroll(el));
    }
  };

  // Desktop scroll handler
  useEffect(() => {
    if (window.innerWidth <= 768) return;

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
      tl.to(".work-flex", { x: -translateX, ease: "none" });
      ScrollTrigger.refresh();
    }

    createTimeline();

    let resizeTimeout: number;
    let lastIsDesktop = true;
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
          ref={handleFlexRef}
          role="region"
          aria-label="Projects"
          aria-roledescription="carousel"
          id="work-flex"
        >
          {config.projects.slice(0, 5).map((project, index) => {
            const projectUrl = 'demoLink' in project && project.demoLink ? project.demoLink : project.link;
            return (
              <div className="work-box" key={project.id} tabIndex={0} data-key={project.id}>
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
          <div className="work-box work-box-cta" tabIndex={0} data-key="cta">
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