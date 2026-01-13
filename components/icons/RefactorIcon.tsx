
import React from 'react';

export const RefactorIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="m21.49 12-8.52-8.52a2.15 2.15 0 0 0-3.04 0L2.51 10.96a2.15 2.15 0 0 0 0 3.04L10.97 22.47a2.15 2.15 0 0 0 3.04 0l7.48-7.48" />
    <path d="m12 12 5.23 5.23" />
    <path d="M4.53 10.96 2.51 13.01" />
    <path d="m16.74 7.79 2.02-2.02" />
  </svg>
);
