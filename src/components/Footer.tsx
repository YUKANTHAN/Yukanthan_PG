import "./styles/Footer.css";
import { config } from "../config";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>{config.fullName}</h3>
        <p className="footer-tagline">
          AI Engineer • Full‑Stack Developer • Passionate about building scalable applications
        </p>
        <p className="footer-copy">© {new Date().getFullYear()} {config.fullName}. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
