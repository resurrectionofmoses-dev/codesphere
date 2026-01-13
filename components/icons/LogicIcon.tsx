
import React from 'react';

export const LogicIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M15 6.5H3" />
    <path d="M15 17.5H3" />
    <path d="M7 21V3" />
    <path d="m21 9-4-4-4 4" />
    <path d="M17 5v11.5" />
  </svg>
);
