import React from 'react';

interface Link {
  url: string;
  title?: string;
}

interface LinkCardProps {
  links: Link[];
}

export function LinkCard({ links }: LinkCardProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className="feed-post-links">
      {links.map((link, idx) => (
        <a
          key={idx}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="link-card"
        >
          <div className="link-card-content">
            <div className="link-card-title">
              {link.title || new URL(link.url).hostname}
            </div>
            <div className="link-card-url">{link.url}</div>
          </div>
          <div className="link-card-icon">↗</div>
        </a>
      ))}
    </div>
  );
}
