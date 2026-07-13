import React from 'react';
import './ProjectCard.css';

interface Project {
  id: number;
  title: string;
  category: string;
  technologies: string;
  image: string;
  description: string;
  link?: string;
  demoLink?: string;
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { id, title, category, technologies, image, description, link, demoLink } = project;
  const imgSrc = image.replace('.png', '.webp');
  return (
    <div className="myworks-card">
      <div className="myworks-card-number">#{id}</div>
      <div className="myworks-card-image">
        <img src={imgSrc} alt={title} loading="lazy" decoding="async" />
      </div>
      <div className="myworks-card-info">
        <h3>{title}</h3>
        <div className="myworks-card-category">{category}</div>
        <p className="myworks-card-description">{description}</p>
        <div className="myworks-card-tech">{technologies}</div>
        <div className="myworks-card-links">
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer" className="myworks-card-link">
              GitHub
            </a>
          )}
          {demoLink && (
            <a href={demoLink} target="_blank" rel="noopener noreferrer" className="myworks-card-link live">
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
