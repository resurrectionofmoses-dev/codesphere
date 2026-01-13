
import React from 'react';

export const OmegaCoderIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M7 8.41C7.5 8.16 8.21 8 9 8c2.76 0 5 2.24 5 5s-2.24 5-5 5c-.79 0-1.5-.16-2.19-.42" />
    <path d="M16 8h-1.5a2.5 2.5 0 1 0 0 5H16" />
    <path d="m5 12-3-3 3-3" />
    <path d="m19 12 3 3-3 3" />
  </svg>
);
