
import React from 'react';

export const GavelIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="m14 12-8.5 8.5" />
    <path d="m17.5 15.5 2.5 2.5" />
    <path d="m12 14 6 6" />
    <path d="m3 21 6-6" />
    <path d="m15 5-3 3" />
    <path d="m9 11 4-4" />
    <path d="m5 15 3-3" />
  </svg>
);
