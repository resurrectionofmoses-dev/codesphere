
import React from 'react';

export const FireIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M11.5 12.5c0-2.5 1.5-5 5-5 .5 0 1 .5 1 1 0 .5-.5 1-1 1 -2.5 0-3.5 1.5-3.5 3.5 0 1 .5 2 2 2s2-1 2-2c0-1.5-1.5-2.5-2.5-2.5" />
    <path d="M15 12c0-2-1-3-3-3s-3 1-3 3c0 .5 0 1.5 1.5 2.5" />
    <path d="M12.5 15C11 16.5 11 18 11 18c0 1-1.5 2-1.5 2-1 0-1.5-1-1.5-2 0 0 .5-1.5 1.5-3" />
    <path d="M17 19c0-1-1-2-3-2s-3 1-3 2c0 .5 0 1.5 1.5 2.5" />
  </svg>
);
