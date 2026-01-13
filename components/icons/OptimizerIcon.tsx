
import React from 'react';

export const OptimizerIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.12" />
    <path d="M12 15.5V13" />
    <path d="M17.5 14.5c1.5-1.26 2-5 2-5s-3.74.5-5 2c-.71.84-.7 2.3-.05 3.12" />
    <path d="M19 12.5V10" />
    <path d="M5 12.5V10" />
    <path d="M12 11.5V9" />
    <path d="M11 2a2 2 0 0 1 2 2v2" />
    <path d="M7 2a2 2 0 0 1 2 2v2" />
    <path d="M15 2a2 2 0 0 1 2 2v2" />
  </svg>
);
