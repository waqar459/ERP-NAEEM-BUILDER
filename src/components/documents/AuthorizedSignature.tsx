import React from 'react';

interface AuthorizedSignatureProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const AuthorizedSignature: React.FC<AuthorizedSignatureProps> = ({
  className = 'w-24 h-12',
  width = 96,
  height = 48,
}) => {
  return (
    <svg
      viewBox="0 0 100 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width, height }}
    >
      {/* Exact authorized signature stroke from user's official PDF */}
      {/* Central vertical stem with slight tilt */}
      <path
        d="M50 8 C49 18, 48 30, 48 42"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Horizontal crossbar with loop */}
      <path
        d="M32 25 C42 24, 52 23, 62 21 C68 20, 72 22, 70 26 C68 30, 60 36, 52 38 C46 40, 40 37, 42 32 C44 26, 56 22, 66 21"
        stroke="#1E293B"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Subtle ink flourish tail */}
      <path
        d="M62 21 C66 21, 74 23, 76 25"
        stroke="#1E293B"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
};
