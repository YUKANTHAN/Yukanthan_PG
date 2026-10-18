import { useState } from "react";
import "./styles/Career.css";
import { config } from "../config";

const getDisplayYear = (period: string) => {
  if (period.includes("Present")) return "NOW";
  if (period.includes(" - ")) {
    return period.split(" - ")[0];
  }
  return period;
};

const MOBILE_VISIBLE_COUNT = 3;

const Career = () => {
  const [expanded, setExpanded] = useState(false);
  const isMobile = window.innerWidth <= 768;

  const visibleExperiences = expanded || !isMobile
    ? config.experiences
    : config.experiences.slice(0, MOBILE_VISIBLE_COUNT);

  const showToggle = isMobile && config.experiences.length > MOBILE_VISIBLE_COUNT;

  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          {visibleExperiences.map((exp, index) => (
            <div key={index} className="career-info-box">
              <div className="career-info-in">
                <div className="career-role">
                  <h4>{exp.position}</h4>
                  <h5>{exp.company}</h5>
                </div>
                <h3>{getDisplayYear(exp.period)}</h3>
              </div>
              <p>{exp.description}</p>
            </div>
          ))}
          {showToggle && (
            <button
              className="career-view-all"
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
            >
              {expanded ? "Show Less" : `View All (${config.experiences.length})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Career;
