import { useLayoutEffect, useEffect, useRef } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const flexRef = useRef<HTMLDivElement>(null);

  // Mobile: synchronous setup before paint
  useLayoutEffect(() => {
    if (window.innerWidth > 768) return;

    const setupMobile = () => {
      const flex = flexRef.current;
      if (!flex) return;

      const boxes = flex.querySelectorAll<HTMLElement>(".work-box");
      const container = flex.closest<HTMLElement>(".work-container");
      if (!boxes.length || !container) return;

      const boxWidth = boxes[0].offsetWidth;
      const containerWidth = container.clientWidth;
      if (!boxWidth || !containerWidth) return;

      const translateX = (boxes.length - 1) * (boxWidth + 16);
      const startOffset = (container.clientWidth - boxWidth) / 2;

      console.log('[Work Mobile] Setup:', { boxWidth, containerWidth, translateX, startOffset, boxes: boxes.length });

      // Set initial centered position via inline style (before ScrollTrigger)
      flex.style.transform = `translateX(${startOffset}px)`;
      flex.style.willChange = "transform";

      // Kill existing
      ScrollTrigger.getById("work")?.kill();

      // Create ScrollTrigger with pin
      ScrollTrigger.create({
        trigger: ".work-section",
        start: "top top",
        end: () => translateX,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        id: "work",
        invalidateOnRefresh: true,
      });

      // Animate from centered start to centered end
      gsap.to(flex, {
        x: -translateX,
        ease: "none",
        scrollTrigger: { id: "work" },
        immediateRender: false,
      });

      // Entry animation for each work card
      gsap.from(".work-box", {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".work-section",
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Entry animation for each work card (immediate, no ScrollTrigger)
      gsap.from(".work-box", {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        ease: "power2.out",
      });
    };

    // Small delay to ensure layout is computed
    requestAnimationFrame(() => {
      requestAnimationFrame(setupMobile);
    });
  }, []);

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    function getTranslateX() {
      const boxes = document.querySelectorAll<HTMLElement>(".work-box");
      const container = document.querySelector<HTMLElement>(".work-container");
      const flex = document.querySelector<HTMLElement>(".work-flex");
      if (!boxes.length || !container || !flex) return undefined;

      const boxWidth = boxes[0].offsetWidth;
      const marginLeft = parseFloat(getComputedStyle(flex).marginLeft) || 0;
      return boxWidth * boxes.length + marginLeft - container.clientWidth;
    }

    function createTimeline() {
      ScrollTrigger.getById("work")?.kill();

      const translateX = getTranslateX();
      if (translateX === undefined) return;

      const tl = gsap.timeline({
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

    let lastIsDesktop = true;
    const handleResize = () => {
      const nowDesktop = window.innerWidth > 768;
      if (nowDesktop === lastIsDesktop) return;
      lastIsDesktop = nowDesktop;
      createTimeline();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ScrollTrigger.getById("work")?.kill();
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