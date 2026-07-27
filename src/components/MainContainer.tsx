import { PropsWithChildren, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import Footer from "./Footer";

import WhatIDo from "./WhatIDo";
import Work from "./Work";
import Certificates from "./Certificates";
import TechStackNew from "./TechStackNew";
import CallToAction from "./CallToAction";
import setSplitText from "./utils/splitText";

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      const desktop = window.innerWidth > 1024;
      setIsDesktopView(desktop);
    };
    resizeHandler();
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <SocialIcons />
      {isDesktopView && children}

      <div>
        <Landing />
        <About />
        <WhatIDo />
        <Career />
        <Work />
        <Certificates />
        <TechStackNew />
        <CallToAction />
        <Contact />
      </div>
      <Footer />
    </div>
  );
};

export default MainContainer;
