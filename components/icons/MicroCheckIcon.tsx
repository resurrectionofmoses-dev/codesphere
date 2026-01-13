
import React from 'react';

export const MicroCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="m21 21-4.3-4.3" />
    <path d="M9 14.2 7.1 12.3" />
    <path d="M12.3 7.1 9 10.4" />
    <circle cx="10.5" cy="10.5" r="7.5" />
  </svg>
);
