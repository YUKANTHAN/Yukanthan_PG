import "./styles/TechStackNew.css";

interface TechItem {
  name: string;
  icon: string;
  url: string;
}

// All tech stack items with their icons and official URLs
// Perfect inverted pyramid: 12 -> 10 -> 8 -> 6 -> 4 -> 2
const techStack: TechItem[][] = [
  // Row 1 - 12 items (largest)
  [
    { name: "Python", icon: "/icons/python-original.svg", url: "https://python.org" },
    { name: "JavaScript", icon: "/icons/javascript-original.svg", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
    { name: "TypeScript", icon: "/icons/typescript-original.svg", url: "https://typescriptlang.org" },
    { name: "C", icon: "/icons/c-original.svg", url: "https://en.cppreference.com/w/c" },
    { name: "C++", icon: "/icons/cplusplus-original.svg", url: "https://isocpp.org" },
    { name: "Kotlin", icon: "/icons/kotlin-original.svg", url: "https://kotlinlang.org" },
    { name: "HTML", icon: "/icons/html5-original.svg", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
    { name: "CSS", icon: "/icons/css3-original.svg", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
    { name: "Bash", icon: "/icons/bash-original.svg", url: "https://www.gnu.org/software/bash/" },
    { name: "React", icon: "/icons/react-original.svg", url: "https://react.dev" },
    { name: "Next.js", icon: "/icons/nextjs-original.svg", url: "https://nextjs.org" },
    { name: "Bootstrap", icon: "/icons/bootstrap-original.svg", url: "https://getbootstrap.com" },
  ],
  // Row 2 - 10 items
  [
    { name: "Node.js", icon: "/icons/nodejs-original.svg", url: "https://nodejs.org" },
    { name: "Django", icon: "/icons/django-plain.svg", url: "https://djangoproject.com" },
    { name: "Flask", icon: "/icons/flask-original.svg", url: "https://flask.palletsprojects.com" },
    { name: "FastAPI", icon: "/icons/fastapi-original.svg", url: "https://fastapi.tiangolo.com" },
    { name: "TensorFlow", icon: "/icons/tensorflow-original.svg", url: "https://tensorflow.org" },
    { name: "PyTorch", icon: "/icons/pytorch-original.svg", url: "https://pytorch.org" },
    { name: "Scikit-learn", icon: "/icons/scikitlearn-original.svg", url: "https://scikit-learn.org" },
    { name: "OpenCV", icon: "/icons/opencv-original.svg", url: "https://opencv.org" },
    { name: "NumPy", icon: "/icons/numpy-original.svg", url: "https://numpy.org" },
    { name: "Tailwind", icon: "/icons/tailwindcss-original.svg", url: "https://tailwindcss.com" },
  ],
  // Row 3 - 8 items
  [
    { name: "Pandas", icon: "/icons/pandas-original.svg", url: "https://pandas.pydata.org" },
    { name: "MySQL", icon: "/icons/mysql-original.svg", url: "https://mysql.com" },
    { name: "PostgreSQL", icon: "/icons/postgresql-original.svg", url: "https://postgresql.org" },
    { name: "MongoDB", icon: "/icons/mongodb-original.svg", url: "https://mongodb.com" },
    { name: "Firebase", icon: "/icons/firebase-plain.svg", url: "https://firebase.google.com" },
    { name: "Redis", icon: "/icons/redis-original.svg", url: "https://redis.io" },
    { name: "Docker", icon: "/icons/docker-original.svg", url: "https://docker.com" },
    { name: "Azure", icon: "/icons/azure-original.svg", url: "https://azure.microsoft.com" },
  ],
  // Row 4 - 6 items
  [
    { name: "Git", icon: "/icons/git-original.svg", url: "https://git-scm.com" },
    { name: "GitHub", icon: "/icons/github-original.svg", url: "https://github.com" },
    { name: "Linux", icon: "/icons/linux-original.svg", url: "https://linux.org" },
    { name: "AWS", icon: "/icons/amazonwebservices-original-wordmark.svg", url: "https://aws.amazon.com" },
    { name: "VS Code", icon: "/icons/vscode-original.svg", url: "https://code.visualstudio.com" },
    { name: "Vercel", icon: "/icons/vercel-original.svg", url: "https://vercel.com" },
  ],
  // Row 5 - 4 items
  [
    { name: "Jupyter", icon: "/icons/jupyter-original.svg", url: "https://jupyter.org" },
    { name: "Figma", icon: "/icons/figma-original.svg", url: "https://figma.com" },
    { name: "Postman", icon: "/icons/postman-original.svg", url: "https://postman.com" },
    { name: "Photoshop", icon: "/icons/photoshop-original.svg", url: "https://adobe.com/products/photoshop" },
  ],
  // Row 6 - 2 items (tip of pyramid)
  [
    { name: "Hugging Face", icon: "/icons/huggingface_logo-noborder.svg", url: "https://huggingface.co" },
    { name: "MS Office", icon: "/icons/microsoft-office-2019.png", url: "https://www.microsoft.com/microsoft-365" },
  ],
];

const TechStackNew = () => {
  return (
    <div className="techstack-new">
      {/* Video Background */}
      <div className="techstack-video-container">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="techstack-video"
        >
          <source src="/video/video.webm" type="video/webm" />
        </video>
        {/* Dark Overlay */}
        <div className="techstack-overlay"></div>
      </div>

      {/* Content */}
      <div className="techstack-content">
        <h2>Tech Stack</h2>
        
        <div className="techstack-pyramid">
          {techStack.map((row, rowIndex) => (
            <div key={rowIndex} className="techstack-row">
              {row.map((tech, techIndex) => (
                <a
                  key={techIndex}
                  href={tech.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="techstack-item"
                  title={tech.name}
                  data-cursor="disable"
                >
                  <img src={tech.icon} alt={tech.name} />
                  <span>{tech.name}</span>
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TechStackNew;
