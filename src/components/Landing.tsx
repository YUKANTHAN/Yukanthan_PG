import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { config } from "../config";

const Landing = ({ children }: PropsWithChildren) => {
  const nameParts = config.fullName.split(" ");
  const firstName = nameParts[0] || config.name;
  const lastName = nameParts.slice(1).join(" ") || "";

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.currentTarget;
    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%231a1a2e'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23c2a4ff' font-family='sans-serif' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";
  };

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              {firstName.toUpperCase()}
              {' '}
              <br />
              {lastName && <span>{lastName.toUpperCase()}</span>}
            </h1>
          </div>
          <div className="landing-info">
            <h3>An</h3>
            <h2 className="landing-info-h2">
              <div className="landing-h2-info">FULL STACK</div>
              <div className="landing-h2-info" style={{ marginLeft: "10px" }}>DEV</div>
            </h2>
            <h2>
              <div className="landing-h2-1">AI ENGINEER</div>
            </h2>
          </div>
          {/* Mobile photo - shows only on mobile when 3D character is hidden */}
          <div className="mobile-photo">
            <img src="/images/mypicnbg.png" alt={config.fullName} onError={handleImageError} />
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
