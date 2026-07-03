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
}

interface ProjectCardProps {
  project: Project;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { id, title, category, technologies, image, description, link } = project;
  const imgSrc = image.replace('.png', '.webp');
  const card = (
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
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="myworks-card-link">
            View Project
          </a>
        )}
      </div>
    </div>
  );
  return link ? (
    <a href={link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
      {card}
    </a>
  ) : (
    card
  );
};

export default ProjectCard;
