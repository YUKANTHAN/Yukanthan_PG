import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect } from "react";
import { config } from "../config";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const Work = () => {
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
        // Handled entirely by CSS scroll-snap
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
      ScrollTrigger.getAll().forEach((st) => {
        if (st.vars.id?.toString().startsWith("work-")) st.kill();
      });
    };
  }, []);
  return (
    <div className="work-section" id="work" data-cursor-section="bright">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {config.projects.slice(0, 5).map((project, index) => {
            const projectUrl = 'demoLink' in project && project.demoLink ? project.demoLink : project.link;
            return (
              <div className="work-box" key={project.id}>
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
          <div className="work-box work-box-cta">
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
