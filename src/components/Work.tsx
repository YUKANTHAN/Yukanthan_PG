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
  const titleRef = useRef<HTMLHeadingElement>(null);

  useLayoutEffect(() => {
    const flex = flexRef.current;
    const title = titleRef.current;
    if (!flex || !title) return;

    const container = flex.closest<HTMLElement>(".work-container");
    if (!container) return;

    const boxes = Array.from(flex.querySelectorAll<HTMLElement>(".work-box"));
    if (!boxes.length) return;

    const isMobile = () => window.innerWidth <= 768;

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
          const cardHeight = boxes[0].offsetHeight;
          const viewportHeight = window.innerHeight;
          const centerY = (viewportHeight - cardHeight) / 2;
          const titleHeight = title.offsetHeight;
          const gap = 20;
          const titleMoveDistance = titleHeight + gap;

          // Initial position: flex starts 40px below title (title margin-top)
          const initialFlexY = 40;
          
          // Phase 1: title moves to top, flex moves with it (stays attached)
          // Phase 2: flex moves from below title to center
          const phase2Dist = centerY - initialFlexY;
          
          // Total scroll distance
          const totalDistance = titleMoveDistance + Math.max(0, phase2Dist) + distance;

          // Progress markers (0 to 1)
          const p1End = titleMoveDistance / totalDistance;
          const p2End = (titleMoveDistance + Math.max(0, phase2Dist)) / totalDistance;

          // Initial states
          gsap.set(title, { y: 0, immediateRender: false });
          gsap.set(flex, { y: 0, immediateRender: false });

          // Single pinned ScrollTrigger with ONE timeline
          gsap.timeline({
            scrollTrigger: {
              trigger: ".work-section",
              start: "top top",
              end: () => `+=${totalDistance}`,
              scrub: 1,
              pin: true,
              pinSpacing: true,
              anticipatePin: 1,
              id: "work",
              invalidateOnRefresh: true,
            },
          })
            // Phase 1 (0 → p1End): Title moves up to pin at top, flex moves same amount
            .to(title, {
              y: -titleMoveDistance,
              ease: "none",
              immediateRender: false,
            }, 0)
            .to(flex, {
              y: -titleMoveDistance,
              ease: "none",
              immediateRender: false,
            }, 0)
            // Phase 2 (p1End → p2End): Flex moves from below title to vertical center
            .to(flex, {
              y: -titleMoveDistance - Math.max(0, phase2Dist),
              ease: "power2.out",
              immediateRender: false,
            }, p1End)
            // Phase 3 (p2End → 1): Horizontal scrub - flex y stays fixed at center
            .fromTo(
              flex,
              { x: startX, immediateRender: false },
              { x: endX, ease: "none", immediateRender: false },
              p2End
            );
        } else {
          // Desktop: single horizontal scrub
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

    const handleResize = () => {
      createAnimation();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      ctx?.revert();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);

  return (
    <div className="work-section" id="work" data-cursor-section="bright">
      <div className="work-container section-container">
        <h2 ref={titleRef}>
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