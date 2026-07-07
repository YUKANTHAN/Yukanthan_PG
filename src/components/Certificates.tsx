import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import "./styles/Certificates.css";

gsap.registerPlugin(ScrollTrigger);

const Certificates = () => {
  const [showAllModal, setShowAllModal] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (showAllModal) {
      const savedScrollY = window.scrollY;

      const st = ScrollTrigger.getById("certificates");
      st?.disable();

      const content = document.querySelector<HTMLElement>(".modal-content");

      const onScroll = () => {
        if (window.scrollY !== savedScrollY) {
          window.scrollTo(0, savedScrollY);
        }
      };

      const onWheel = (e: Event) => {
        const we = e as WheelEvent;
        if (!content) return;
        we.stopPropagation();
        const { scrollTop, scrollHeight, clientHeight } = content;
        const atTop = scrollTop <= 0;
        const atBottom = scrollTop + clientHeight >= scrollHeight;
        if ((we.deltaY < 0 && atTop) || (we.deltaY > 0 && atBottom)) {
          we.preventDefault();
        }
      };

      let lastTouchY = 0;

      const onTouchMove = (e: Event) => {
        const te = e as TouchEvent;
        if (!content) return;
        if (content.contains(te.target as Node)) {
          const touchY = te.touches[0].clientY;
          const deltaY = lastTouchY - touchY;
          const { scrollTop, scrollHeight, clientHeight } = content;
          const atTop = scrollTop <= 0;
          const atBottom = scrollTop + clientHeight >= scrollHeight;
          if ((deltaY < 0 && atTop) || (deltaY > 0 && atBottom)) {
            te.preventDefault();
          }
          lastTouchY = touchY;
        } else {
          te.preventDefault();
        }
      };

      const onTouchStart = (e: Event) => {
        const te = e as TouchEvent;
        if (content?.contains(te.target as Node)) {
          lastTouchY = te.touches[0].clientY;
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });
      content?.addEventListener("wheel", onWheel, { passive: false });
      content?.addEventListener("touchstart", onTouchStart, { passive: true });
      document.body.addEventListener("touchmove", onTouchMove, { passive: false });

      return () => {
        window.removeEventListener("scroll", onScroll);
        content?.removeEventListener("wheel", onWheel);
        content?.removeEventListener("touchstart", onTouchStart);
        document.body.removeEventListener("touchmove", onTouchMove);
        ScrollTrigger.getById("certificates")?.enable();
        ScrollTrigger.refresh();
        window.scrollTo(0, savedScrollY);
      };
    }
  }, [showAllModal]);

  const allCertificates = [
    ...config.certificates.events.map(c => ({ ...c, category: "Event" })),
    ...config.certificates.learnings.map(c => ({ ...c, category: "Learning" })),
    ...(config.certificates.modalOnly || []).map(c => ({ ...c, category: "Certificate" })),
  ];
  useEffect(() => {
    // Only animate stacks on desktop viewports
    if (window.innerWidth <= 1024) return;

    const leftCardsCount = config.certificates.events.length;
    const rightCardsCount = config.certificates.learnings.length;
    const maxCards = Math.max(leftCardsCount, rightCardsCount);

    // Calculate total scroll distance based on number of cards
    const scrollDistance = maxCards * 400;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".certificates-section",
        start: "top top",
        end: `+=${scrollDistance}`,
        scrub: 1,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        id: "certificates",
        invalidateOnRefresh: true,
      },
    });

    // We animate all cards from top (index 0) to bottom (index maxCards - 1)
    // For a stack of cards, card index 0 is on top and has highest z-index.
    // Animating them to slide out one-by-one looks like peeling off a deck.
    for (let i = 0; i < maxCards; i++) {
      const staggerTime = i * 1.2;

      // Animate left card (events) to slide left and fade out (skip last card)
      if (i < leftCardsCount - 1) {
        timeline.to(
          `.left-card-${i}`,
          {
            x: "-180%",
            y: "-40px",
            rotation: -25,
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          staggerTime
        );
      }

      // Animate right card (learnings) to slide right and fade out (skip last card)
      if (i < rightCardsCount - 1) {
        timeline.to(
          `.right-card-${i}`,
          {
            x: "180%",
            y: "-40px",
            rotation: 25,
            opacity: 0,
            duration: 1,
            ease: "power2.inOut",
          },
          staggerTime
        );
      }
    }

    // Refresh ScrollTrigger to ensure proper heights and trigger bounds
    ScrollTrigger.refresh();

    // Clean up
    return () => {
      timeline.kill();
      ScrollTrigger.getById("certificates")?.kill();
    };
  }, []);

  const openPdf = (filename: string) => {
    window.open(`/certificates/${filename}`, "_blank", "noopener,noreferrer");
  };

  // Stack styling helper: gives card a subtle layout offset so they look like a real physical stack
  const getStackStyle = (index: number, total: number) => {
    if (window.innerWidth <= 1024) return {};
    
    // We want the top card (index 0) to have the highest z-index
    // Subtly rotate and shift the cards below it to expose edges
    const zIndex = total - index;
    const rotate = (index % 2 === 0 ? 1 : -1) * (index * 2);
    const translateY = index * 4;
    const translateX = (index % 2 === 0 ? 1 : -1) * (index * 2);

    return {
      zIndex,
      transform: `translate3d(${translateX}px, ${translateY}px, 0) rotate(${rotate}deg)`,
    };
  };

  const getImagePath = (filename: string) => {
    const pngName = filename.replace(/\.(pdf|docx)$/i, '.png');
    return `/certificates/${pngName}`;
  };

  return (
    <div className="certificates-section" id="certificates">
      <div className="certificates-container">
        <div className="certificates-header">
          <h2>
            My <span>Credentials</span>
          </h2>
          <p>Recognitions, hackathons, and continuous learning achievements</p>
        </div>

        <div className="certificates-grid">
          {/* Left Column: Event Certificates */}
          <div className="certificates-column">
            <h3>Event Certificates</h3>
            <div className="certificate-stack">
              {config.certificates.events.map((cert, index) => (
                <div
                  className={`certificate-card left-card-${index}`}
                  key={`event-${cert.id}`}
                  style={getStackStyle(index, config.certificates.events.length)}
                  onClick={() => openPdf(cert.file)}
                  data-cursor="disable"
                >
                  <div className="certificate-image-container">
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      className="certificate-img"
                      loading="lazy"
                    />
                    <div className="certificate-overlay">
                      <div className="overlay-content">
                        <span className="certificate-org">{cert.organization}</span>
                        <h4>{cert.title}</h4>
                        <span className="view-link">View PDF ↗</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Learning Certificates */}
          <div className="certificates-column">
            <h3>Learning Certificates</h3>
            <div className="certificate-stack">
              {config.certificates.learnings.map((cert, index) => (
                <div
                  className={`certificate-card right-card-${index}`}
                  key={`learning-${cert.id}`}
                  style={getStackStyle(index, config.certificates.learnings.length)}
                  onClick={() => openPdf(cert.file)}
                  data-cursor="disable"
                >
                  <div className="certificate-image-container">
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      className="certificate-img"
                      loading="lazy"
                    />
                    <div className="certificate-overlay">
                      <div className="overlay-content">
                        <span className="certificate-org">{cert.organization}</span>
                        <h4>{cert.title}</h4>
                        <span className="view-link">View PDF ↗</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button className="view-all-btn" onClick={() => setShowAllModal(true)}>
          View All Certificates
        </button>
      </div>

      {showAllModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAllModal(false)}>
          <div className="modal-content" ref={modalContentRef} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAllModal(false)}>
              ✕
            </button>
            <h2>All <span>Certificates</span></h2>
            <div className="modal-grid">
              {allCertificates.map(cert => (
                <div
                  className="modal-card"
                  key={`${cert.category}-${cert.id}`}
                  onClick={() => openPdf(cert.file)}
                >
                  <div className="modal-card-image">
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      loading="lazy"
                    />
                    <div className="modal-card-overlay">
                      <span>View PDF ↗</span>
                    </div>
                  </div>
                  <div className="modal-card-info">
                    <span className="modal-card-category">{cert.category}</span>
                    <h4>{cert.title}</h4>
                    <span className="modal-card-org">{cert.organization}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Certificates;
