import { useLayoutEffect, useRef } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
  const flexRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const flex = flexRef.current;
    if (!flex) return;

    const container = flex.closest<HTMLElement>(".work-container");
    if (!container) return;

    const boxes = Array.from(flex.querySelectorAll<HTMLElement>(".work-box"));
    if (!boxes.length) return;

    const isMobile = () => window.innerWidth <= 768;

    // Vertically center the cards within the section.
    // boxes[0].offsetTop is relative to .work-flex (position: relative),
    // so add flex's own offset inside .work-section to get the true card top.
    const centerCards = () => {
      if (!isMobile()) return;
      const cardHeight = boxes[0].offsetHeight;
      const cardCenterY = (window.innerHeight - cardHeight) / 2;
      const cardInitialTop = flex.offsetTop + boxes[0].offsetTop;
      gsap.set(flex, { y: cardCenterY - cardInitialTop });
    };

    const measure = () => {
      const prevTransform = flex.style.transform;
      flex.style.transform = "none";

      const cRect = container.getBoundingClientRect();
      const first = boxes[0].getBoundingClientRect();
      const last = boxes[boxes.length - 1].getBoundingClientRect();

      flex.style.transform = prevTransform;

      const startX = isMobile()
        ? cRect.left + (cRect.width - first.width) / 2 - first.left
        : 0;

      const endX = isMobile()
        ? cRect.left + (cRect.width - last.width) / 2 - last.left
        : cRect.right - last.right;

      return { startX, endX, distance: Math.abs(endX - startX) };
    };

    let ctx: gsap.Context | null = null;

    const createAnimation = () => {
      ctx?.revert();
      ScrollTrigger.getById("work")?.kill();
      ScrollTrigger.getById("work-title")?.kill();
      ScrollTrigger.getById("work-cards-center")?.kill();
      ScrollTrigger.getById("work-pin")?.kill();

      ctx = gsap.context(() => {
        const { startX, endX, distance } = measure();

        if (isMobile()) {
          // Pre-position cards at the center before the pin starts
          centerCards();

          // Horizontal scrub: first card centered → last card centered.
          // Title is not animated – it stays at its natural spot at the top.
          gsap.timeline({
            scrollTrigger: {
              trigger: ".work-section",
              start: "top top",
              end: () => `+=${distance}`,
              scrub: 1,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              id: "work",
              invalidateOnRefresh: true,
            },
          }).fromTo(
            flex,
            { x: startX, immediateRender: false },
            { x: endX, ease: "none", immediateRender: false },
            0
          );
        } else {
          // Desktop: single horizontal scrub (reset any leftover mobile offset)
          gsap.set(flex, { y: 0 });
          gsap.timeline({
            scrollTrigger: {
              trigger: ".work-section",
              start: "top top",
              end: () => `+=${distance}`,
              scrub: 1,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              id: "work",
              invalidateOnRefresh: true,
            },
          }).fromTo(
            flex,
            { x: startX, immediateRender: false },
            { x: endX, ease: "none", immediateRender: false },
            0
          );
        }
      });
    };

    createAnimation();

    // Re-center when a card's height changes (e.g. images finish loading)
    const observer = new ResizeObserver(() => centerCards());
    observer.observe(boxes[0]);

    const handleResize = () => {
      createAnimation();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      ctx?.revert();
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