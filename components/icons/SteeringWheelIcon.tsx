
import React from 'react';

export const SteeringWheelIcon: React.FC<{ className?: string }> = ({ className }) => (
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
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 14v6" />
    <path d="m16.17 10.33 4.33-2.5" />
    <path d="m3.5 7.83 4.33 2.5" />
    <path d="M12 4V2" />
  </svg>
);
