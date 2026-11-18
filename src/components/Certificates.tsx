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

  // Certificate data - single source of truth
  const gridCertificates = config.certificates.filter(c => c.display === "grid" || c.display === "both");
  const modalCertificates = config.certificates.filter(c => c.display === "modal" || c.display === "both");

  // Mobile Card Deck State
  const [mobileCategory, setMobileCategory] = useState<"all" | "events" | "learnings">("all");
  const [deckIndex, setDeckIndex] = useState(0);
  const [isFlinging, setIsFlinging] = useState<"left" | "right" | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [lightboxFile, setLightboxFile] = useState<string | null>(null);
  const lightboxRef = useRef<HTMLDivElement | null>(null);
  const lightboxStartY = useRef(0);
  const lightboxDY = useRef(0);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const [portraitImages, setPortraitImages] = useState<Set<string>>(new Set());

  const mobileList = useMemo(() => {
    if (mobileCategory === "events") {
      return gridCertificates.filter(c => c.category === "Event");
    }
    if (mobileCategory === "learnings") {
      return gridCertificates.filter(c => c.category === "Learning");
    }
    return gridCertificates;
  }, [mobileCategory, gridCertificates]);

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

  // Fullscreen lightbox: lock scroll + close on Escape
  useEffect(() => {
    if (!lightboxFile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxFile(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxFile]);

  // Drag the lightbox to dismiss it (springs back below the threshold)
  const onLightboxTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return;
    lightboxStartY.current = e.touches[0].clientY;
    lightboxDY.current = 0;
    if (lightboxRef.current) {
      lightboxRef.current.style.transition = "none";
    }
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 1) return;
    const dy = e.touches[0].clientY - lightboxStartY.current;
    lightboxDY.current = dy;
    const el = lightboxRef.current;
    if (!el) return;
    el.style.transform = `translateY(${dy}px)`;
    el.style.opacity = String(Math.max(0, 1 - Math.abs(dy) / 350));
  };

  const onLightboxTouchEnd = () => {
    const el = lightboxRef.current;
    if (!el) return;
    if (Math.abs(lightboxDY.current) > 90) {
      setLightboxFile(null);
      return;
    }
    el.style.transition = "transform 0.25s ease, opacity 0.25s ease";
    el.style.transform = "translateY(0)";
    el.style.opacity = "1";
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

  const zynexCert = modalCertificates.find(c => c.title === "ZYNEX 2K26 Paper Presentation");
  const satwaCert = modalCertificates.find(c => c.title === "Satwa Round 1 Certificate");
  const participationCert = modalCertificates.find(c => c.title === "Certificate of Participation");
  const cluelessCert = modalCertificates.find(c => c.title === "Nzevotrix 24 Clueless Code");
  const scimitCert = modalCertificates.find(c => c.title === "SCIMIT 26 Mega Project");
  const kalasalingamCert = modalCertificates.find(c => c.title === "AI Olympics");
  const tataCert = modalCertificates.find(c => c.title === "GenAI Powered Data Analytics Job Simulation");
  const techbairnCert = modalCertificates.find(c => c.title === "Campus Associate Internship");
  const bluestockCert = modalCertificates.find(c => c.title === "Internship Offer Letter");
  const devfusionCert = modalCertificates.find(c => c.title === "Devfusion");
  const devcationCert = modalCertificates.find(c => c.title === "Devcation Delhi 2026");
  const devfusion2Cert = modalCertificates.find(c => c.title === "DevFusion 2.0");
  const necCodeRelayCert = modalCertificates.find(c => c.title === "NEC Tech Fest Code Relay");
  const necDigBugCert = modalCertificates.find(c => c.title === "NEC Tech Fest Dig the Bug");
  const bplanCert = modalCertificates.find(c => c.title === "B-Plan Competition");
  const dream2realityCert = modalCertificates.find(c => c.title === "Dream2Reality Idea Competition");
  const infovateJPCert = modalCertificates.find(c => c.title === "INFOVATE 2026 Participation");
  const zynexCheckmateCert = modalCertificates.find(c => c.title === "ZYNEX 2K26 Check Mate");
  const nitDelhiCert = modalCertificates.find(c => c.title === "HackIndia Spark 6");
  const quantcraftCert = modalCertificates.find(c => c.title === "QuantCraft");
  const unstopWinsCert = modalCertificates.find(c => c.title === "Unstop Week-of-Wins");
  const unstopPredictionCert = modalCertificates.find(c => c.title === "Unstop Prediction");
  const nextDialogCert = modalCertificates.find(c => c.title === "Next Dialog E-Summit'26");
  const devfusionR2Cert = modalCertificates.find(c => c.title === "Devfusion Hackathon Round 2");
  let zynexInserted = false;

  const allCertificates = modalCertificates.flatMap(cert => {
    if (cert.title === "ApoorvCTF'26" && zynexCert && !zynexInserted) {
      zynexInserted = true;
      const group = [cert];
      if (zynexCert) group.push({ ...zynexCert });
      if (satwaCert) group.push({ ...satwaCert });
      if (participationCert) group.push({ ...participationCert });
      if (cluelessCert) group.push({ ...cluelessCert });
      if (scimitCert) group.push({ ...scimitCert });
      if (kalasalingamCert) group.push({ ...kalasalingamCert });
      if (tataCert) group.push({ ...tataCert });
      if (techbairnCert) group.push({ ...techbairnCert });
      if (bluestockCert) group.push({ ...bluestockCert });
      if (devcationCert) group.push({ ...devcationCert });
      if (devfusion2Cert) group.push({ ...devfusion2Cert });
      if (necCodeRelayCert) group.push({ ...necCodeRelayCert });
      if (necDigBugCert) group.push({ ...necDigBugCert });
      if (bplanCert) group.push({ ...bplanCert });
      if (dream2realityCert) group.push({ ...dream2realityCert });
      if (infovateJPCert) group.push({ ...infovateJPCert });
      if (zynexCheckmateCert) group.push({ ...zynexCheckmateCert });
      if (nitDelhiCert) group.push({ ...nitDelhiCert });
      if (quantcraftCert) group.push({ ...quantcraftCert });
      if (unstopWinsCert) group.push({ ...unstopWinsCert });
      if (unstopPredictionCert) group.push({ ...unstopPredictionCert });
      if (nextDialogCert) group.push({ ...nextDialogCert });
      if (devfusionR2Cert) group.push({ ...devfusionR2Cert });
      if (devfusionCert) group.push({ ...devfusionCert });
      return group;
    }
    if (cert.title === "ZYNEX 2K26 Paper Presentation") return [];
    if (cert.title === "Satwa Round 1 Certificate") return [];
    if (cert.title === "Certificate of Participation") return [];
    if (cert.title === "Nzevotrix 24 Clueless Code") return [];
    if (cert.title === "SCIMIT 26 Mega Project") return [];
    if (cert.title === "AI Olympics") return [];
    if (cert.title === "GenAI Powered Data Analytics Job Simulation") return [];
    if (cert.title === "Campus Associate Internship") return [];
    if (cert.title === "Internship Offer Letter") return [];
    if (cert.title === "Devfusion") return [];
    if (cert.title === "Devcation Delhi 2026") return [];
    if (cert.title === "DevFusion 2.0") return [];
    if (cert.title === "NEC Tech Fest Code Relay") return [];
    if (cert.title === "NEC Tech Fest Dig the Bug") return [];
    if (cert.title === "B-Plan Competition") return [];
    if (cert.title === "Dream2Reality Idea Competition") return [];
    if (cert.title === "INFOVATE 2026 Participation") return [];
    if (cert.title === "ZYNEX 2K26 Check Mate") return [];
    if (cert.title === "HackIndia Spark 6") return [];
    if (cert.title === "QuantCraft") return [];
    if (cert.title === "Unstop Week-of-Wins") return [];
    if (cert.title === "Unstop Prediction") return [];
    if (cert.title === "Next Dialog E-Summit'26") return [];
    if (cert.title === "Devfusion Hackathon Round 2") return [];
    return cert;
  });
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
    const leftCardsCount = gridCertificates.filter(c => c.category === "Event").length;
    const rightCardsCount = gridCertificates.filter(c => c.category === "Learning").length;
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
  }, [gridCertificates]);

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

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, filename: string) => {
    const img = e.currentTarget;
    if (img.naturalHeight > img.naturalWidth) {
      setPortraitImages(prev => new Set([...prev, filename]));
    }
  };

  const getZoomClass = (filename: string) => {
    if (filename === 'Yukanthan P G _ Satwa Round1 certificate.pdf' || filename === 'Yukanthan P G .pdf') {
      return 'custom-zoom';
    }
    return '';
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
              {gridCertificates.filter(c => c.category === "Event").map((cert, index) => (
                <div
                  className={`certificate-card left-card-${index}`}
                  key={`event-${cert.id}`}
                  style={getStackStyle(index, gridCertificates.filter(c => c.category === "Event").length)}
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
              {gridCertificates.filter(c => c.category === "Learning").map((cert, index) => (
                <div
                  className={`certificate-card right-card-${index}`}
                  key={`learning-${cert.id}`}
                  style={getStackStyle(index, gridCertificates.filter(c => c.category === "Learning").length)}
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
              All ({gridCertificates.length})
            </button>
            <button
              className={`deck-tab ${mobileCategory === "events" ? "active" : ""}`}
              onClick={() => handleCategoryChange("events")}
              data-cursor="disable"
            >
              Events ({gridCertificates.filter(c => c.category === "Event").length})
            </button>
            <button
              className={`deck-tab ${mobileCategory === "learnings" ? "active" : ""}`}
              onClick={() => handleCategoryChange("learnings")}
              data-cursor="disable"
            >
              Learnings ({gridCertificates.filter(c => c.category === "Learning").length})
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
                key={`deck-top-${mobileCategory}-${deckIndex}`}
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
                  onClick={() => setLightboxFile(mobileList[deckIndex].file)}
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
                  <div className={`modal-card-image ${portraitImages.has(cert.file) ? 'portrait' : ''} ${getZoomClass(cert.file)}`}>
                    <img
                      src={getImagePath(cert.file)}
                      alt={cert.title}
                      loading="lazy"
                      onError={handleImageError}
                      onLoad={(e) => handleImageLoad(e, cert.file)}
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

      {lightboxFile && createPortal(
        <div
          className="lightbox-overlay"
          ref={lightboxRef}
          onClick={() => setLightboxFile(null)}
          onTouchStart={onLightboxTouchStart}
          onTouchMove={onLightboxTouchMove}
          onTouchEnd={onLightboxTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Certificate preview"
          data-cursor-section="bright"
        >
          <button
            className="lightbox-close"
            onClick={() => setLightboxFile(null)}
            aria-label="Close preview"
            data-cursor="disable"
          >
            ✕
          </button>
          <img
            className="lightbox-img"
            src={getImagePath(lightboxFile)}
            alt="Certificate preview"
            onClick={(e) => e.stopPropagation()}
            onError={handleImageError}
          />
          <a
            className="lightbox-pdf-btn"
            href={`/certificates/${lightboxFile}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            data-cursor="disable"
          >
            Open PDF ↗
          </a>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Certificates;
