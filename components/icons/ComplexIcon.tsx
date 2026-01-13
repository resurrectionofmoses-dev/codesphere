
import React from 'react';

export const ComplexIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M12 10v4" />
    <path d="m10.04 11.96-2.49-1.44" />
    <path d="m13.96 11.96 2.49-1.44" />
    <path d="M10.04 14.04 7.55 15.48" />
    <path d="m13.96 14.04 2.49 1.44" />
    <path d="M4.5 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    <path d="M19.5 12.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    <path d="M12 7a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
    <path d="M12 22a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z" />
  </svg>
);
