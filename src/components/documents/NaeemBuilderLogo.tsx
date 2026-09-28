import React from 'react';

interface NaeemBuilderLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const NaeemBuilderLogo: React.FC<NaeemBuilderLogoProps> = ({
  className = 'w-16 h-12',
  width = 68,
  height = 48,
}) => {
  return (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width, height }}
    >
      {/* Exact calligraphic red swoosh ribbon logo from user's official PDF */}
      <path
        d="M12 68 C10 65, 8 58, 14 42 C22 22, 34 8, 44 9 C49 10, 48 18, 40 32 C34 42, 26 56, 22 62 C32 45, 52 35, 78 38 C98 40, 114 48, 118 51 C112 51, 95 44, 76 43 C52 41, 32 50, 18 69 C15 72, 13 71, 12 68 Z"
        fill="#E11D48"
      />
      {/* Secondary fluid accent line for brush depth */}
      <path
        d="M20 58 C28 40, 42 16, 45 14 C46 13, 44 19, 38 34 C32 48, 25 61, 21 66 C20 67, 19 63, 20 58 Z"
        fill="#BE123C"
        opacity="0.9"
      />
      {/* Sweeping horizontal trail */}
      <path
        d="M38 46 C56 38, 80 40, 108 49 C114 51, 118 52, 116 53 C112 53, 94 47, 72 45 C50 43, 34 49, 28 53 C31 49, 34 47, 38 46 Z"
        fill="#E11D48"
      />
    </svg>
  );
};
