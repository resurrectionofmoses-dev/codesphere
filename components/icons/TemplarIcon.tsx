
import React from 'react';

export const TemplarIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
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
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M14.5 9.5c0-2-1.5-3.5-3.5-3.5-2.25 0-2.5 2-2.5 3.5 0 2.25 2.5 4.5 3.5 4.5s2.5-2.25 2.5-4.5Z" />
    <path d="M12 14v2" />
  </svg>
);
