import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { config } from "../config";
import "./styles/Certificates.css";

gsap.registerPlugin(ScrollTrigger);

const Certificates = () => {
  const [showAllModal, setShowAllModal] = useState(false);
  const modalContentRef = useRef<HTMLDivElement | null>(null);

  // Mobile Card Deck State
  const [mobileCategory, setMobileCategory] = useState<"all" | "events" | "learnings">("all");
  const [deckIndex, setDeckIndex] = useState(0);
  const [isFlinging, setIsFlinging] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const mobileList = useMemo(() => {
    if (mobileCategory === "events") {
      return config.certificates.events.map((c) => ({ ...c, category: "Event" }));
    }
    if (mobileCategory === "learnings") {
      return config.certificates.learnings.map((c) => ({ ...c, category: "Learning" }));
    }
    return [
      ...config.certificates.events.map((c) => ({ ...c, category: "Event" })),
      ...config.certificates.learnings.map((c) => ({ ...c, category: "Learning" })),
    ];
  }, [mobileCategory]);

  const handleCategoryChange = (cat: "all" | "events" | "learnings") => {
    setMobileCategory(cat);
    setDeckIndex(0);
    setDragOffset(0);
    setIsFlinging(null);
  };

  const handleNextCard = useCallback(() => {
    if (isFlinging || mobileList.length <= 1) return;
    setIsFlinging("left");
    setTimeout(() => {
      setDeckIndex((prev) => (prev + 1) % mobileList.length);
      setIsFlinging(null);
      setDragOffset(0);
    }, 240);
  }, [isFlinging, mobileList.length]);

  const handlePrevCard = useCallback(() => {
    if (isFlinging || mobileList.length <= 1) return;
    setIsFlinging("right");
    setTimeout(() => {
      setDeckIndex((prev) => (prev - 1 + mobileList.length) % mobileList.length);
      setIsFlinging(null);
      setDragOffset(0);
    }, 240);
  }, [isFlinging, mobileList.length]);

  const handleShuffle = useCallback(() => {
    if (isFlinging || mobileList.length <= 1) return;
    setIsFlinging("left");
    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * mobileList.length);
      if (nextIdx === deckIndex) nextIdx = (nextIdx + 1) % mobileList.length;
      setDeckIndex(nextIdx);
      setIsFlinging(null);
      setDragOffset(0);
    }, 240);
  }, [isFlinging, mobileList.length, deckIndex]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (isFlinging) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - touchStartX.current;
    const deltaY = currentY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      setDragOffset(Math.max(-120, Math.min(120, deltaX)));
    }
  };

  const onTouchEnd = () => {
    if (isFlinging) return;
    if (dragOffset < -45) {
      handleNextCard();
    } else if (dragOffset > 45) {
      handlePrevCard();
    } else {
      setDragOffset(0);
    }
  };

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
    const isMobile = window.innerWidth <= 768;
    const isTablet = window.innerWidth <= 1024 && window.innerWidth > 768;

    if (isMobile) {
      // Mobile: simple vertical stack (no pin, no parallax) — avoids conflict with Work parallax
      return;
    }

    if (isTablet) {
      // Tablet: disable pinning, allow normal scroll
      return;
    }

    // Desktop: horizontal peel-off stack
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

  const handleCardClick = (filename: string) => {
    openPdf(filename);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent, filename: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPdf(filename);
    }
  };

  const openPdf = (filename: string) => {
    const url = `/certificates/${filename}`;
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='200'%3E%3Crect width='300' height='200' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23c2a4ff' font-family='sans-serif' font-size='14'%3ENo Preview%3C/text%3E%3C/svg%3E";
  };

  return (
    <div className="certificates-section" id="certificates" data-cursor-section="bright">
      <div className="certificates-container">
        <div className="certificates-header">
          <h2>
            My <span>Credentials</span>
          </h2>
          <p>Recognitions, hackathons, and continuous learning achievements</p>
        </div>

        {/* Desktop Grid: Untouched & preserved */}
        <div className="certificates-grid certificates-desktop-only">
          {/* Left Column: Event Certificates */}
          <div className="certificates-column">
            <h3>Event Certificates</h3>
            <div className="certificate-stack">
              {config.certificates.events.map((cert, index) => (
                <div
                  className={`certificate-card left-card-${index}`}
                  key={`event-${cert.id}`}
                  style={getStackStyle(index, config.certificates.events.length)}
                  onClick={() => handleCardClick(cert.file)}
                  onKeyDown={(e) => handleCardKeyDown(e, cert.file)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${cert.title} certificate from ${cert.organization}`}
                  data-cursor="disable"
                >
                  <div className="certificate-image-container">
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      className="certificate-img"
                      loading="lazy"
                      onError={handleImageError}
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
                  onClick={() => handleCardClick(cert.file)}
                  onKeyDown={(e) => handleCardKeyDown(e, cert.file)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${cert.title} certificate from ${cert.organization}`}
                  data-cursor="disable"
                >
                  <div className="certificate-image-container">
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      className="certificate-img"
                      loading="lazy"
                      onError={handleImageError}
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

        {/* Mobile Interactive Card Deck */}
        <div className="certificates-mobile-deck">
          {/* Category Filter Pills */}
          <div className="mobile-deck-tabs">
            <button
              className={`deck-tab ${mobileCategory === "all" ? "active" : ""}`}
              onClick={() => handleCategoryChange("all")}
              data-cursor="disable"
            >
              All ({config.certificates.events.length + config.certificates.learnings.length})
            </button>
            <button
              className={`deck-tab ${mobileCategory === "events" ? "active" : ""}`}
              onClick={() => handleCategoryChange("events")}
              data-cursor="disable"
            >
              Events ({config.certificates.events.length})
            </button>
            <button
              className={`deck-tab ${mobileCategory === "learnings" ? "active" : ""}`}
              onClick={() => handleCategoryChange("learnings")}
              data-cursor="disable"
            >
              Learnings ({config.certificates.learnings.length})
            </button>
          </div>

          {/* Interactive Stacked Cards Stage */}
          <div
            className="mobile-deck-stage"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Card 2 (Bottom layer) */}
            {mobileList.length > 2 && (
              <div className="deck-card deck-card-bottom" aria-hidden="true">
                <div className="deck-card-preview">
                  <img
                    src={getImagePath(mobileList[(deckIndex + 2) % mobileList.length].file)}
                    alt=""
                    onError={handleImageError}
                  />
                </div>
              </div>
            )}

            {/* Card 1 (Middle layer) */}
            {mobileList.length > 1 && (
              <div className="deck-card deck-card-middle" aria-hidden="true">
                <div className="deck-card-preview">
                  <img
                    src={getImagePath(mobileList[(deckIndex + 1) % mobileList.length].file)}
                    alt=""
                    onError={handleImageError}
                  />
                </div>
              </div>
            )}

            {/* Card 0 (Active Front Card) */}
            {mobileList[deckIndex] && (
              <div
                className={`deck-card deck-card-top ${isFlinging ? `fling-${isFlinging}` : ""}`}
                style={{
                  transform:
                    !isFlinging && dragOffset
                      ? `translate3d(${dragOffset}px, 0, 0) rotate(${dragOffset * 0.08}deg)`
                      : undefined,
                }}
              >
                <div className="deck-card-header">
                  <span className="deck-badge">{mobileList[deckIndex].category}</span>
                  <span className="deck-counter">
                    {String(deckIndex + 1).padStart(2, "0")} / {String(mobileList.length).padStart(2, "0")}
                  </span>
                </div>

                <div
                  className="deck-card-preview"
                  onClick={() => handleCardClick(mobileList[deckIndex].file)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${mobileList[deckIndex].title} certificate`}
                >
                  <img
                    src={getImagePath(mobileList[deckIndex].file)}
                    alt={mobileList[deckIndex].title}
                    onError={handleImageError}
                  />
                  <div className="deck-preview-glass">
                    <span>Tap to open PDF ↗</span>
                  </div>
                </div>

                <div className="deck-card-body">
                  <h4>{mobileList[deckIndex].title}</h4>
                  <p className="deck-card-org">{mobileList[deckIndex].organization}</p>
                  <div className="deck-card-footer">
                    <span className="deck-date">{mobileList[deckIndex].date || "2026"}</span>
                    <button
                      className="deck-view-btn"
                      onClick={() => handleCardClick(mobileList[deckIndex].file)}
                      data-cursor="disable"
                    >
                      View PDF ↗
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deck Controls */}
          <div className="mobile-deck-controls">
            <button
              className="deck-ctrl-btn"
              onClick={handlePrevCard}
              aria-label="Previous certificate"
              data-cursor="disable"
            >
              ←
            </button>
            <button
              className="deck-shuffle-btn"
              onClick={handleShuffle}
              aria-label="Shuffle card deck"
              data-cursor="disable"
            >
              🔀 Next
            </button>
            <button
              className="deck-ctrl-btn"
              onClick={handleNextCard}
              aria-label="Next certificate"
              data-cursor="disable"
            >
              →
            </button>
          </div>

          <p className="mobile-deck-hint">Swipe or tap Next to shuffle deck</p>
        </div>

        <button className="view-all-btn" onClick={() => setShowAllModal(true)} data-cursor="disable">
          View All Certificates
        </button>
      </div>

      {showAllModal && createPortal(
        <div className="modal-overlay" onClick={() => setShowAllModal(false)} data-cursor-section="bright">
          <div className="modal-content" ref={modalContentRef} onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowAllModal(false)} aria-label="Close modal" data-cursor="disable">
              ✕
            </button>
            <h2>All <span>Certificates</span></h2>
            <div className="modal-grid">
              {allCertificates.map(cert => (
                <div
                  className="modal-card"
                  key={`${cert.category}-${cert.id}`}
                  onClick={() => handleCardClick(cert.file)}
                  onKeyDown={(e) => handleCardKeyDown(e, cert.file)}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${cert.title} certificate from ${cert.organization}`}
                  data-cursor="disable"
                >
                  <div className="modal-card-image">
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      loading="lazy"
                      onError={handleImageError}
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
