
import React from 'react';

export const QuantumGuardianIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <circle cx="12" cy="12" r="2" />
    <ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(45 12 12)" />
    <ellipse cx="12" cy="12" rx="4" ry="8" transform="rotate(-45 12 12)" />
  </svg>
);
