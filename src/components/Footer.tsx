import "./styles/Footer.css";
import { config } from "../config";
import { MdCopyright } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>{config.fullName}</h3>
        <p className="footer-tagline">
          AI Engineer • Full‑Stack Developer • Passionate about building scalable applications
        </p>
        <p className="footer-copy">© {new Date().getFullYear()} {config.fullName}. All rights reserved.</p>
        <p className="footer-credit">
          Designed and Developed by <span>{config.fullName}</span>
          <span className="footer-copyright-icon"><MdCopyright /> {new Date().getFullYear()}</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
