"use client";

const MEMOJI_THEMES = [
  { bg: "#FDE6D8", skin: "#D99B72", hair: "#2B1E1A", shirt: "#1B3B36", glasses: false, cap: false },
  { bg: "#DCECE7", skin: "#C6865C", hair: "#1C1917", shirt: "#C85A32", glasses: true, cap: false },
  { bg: "#E6E4F0", skin: "#E8B491", hair: "#4A2C20", shirt: "#334155", glasses: false, cap: true },
  { bg: "#F5E8C7", skin: "#B8744B", hair: "#1E1B18", shirt: "#0F766E", glasses: true, cap: false },
  { bg: "#E2ECE9", skin: "#E0AC8B", hair: "#2D232E", shirt: "#9A3412", glasses: false, cap: false },
  { bg: "#FCE7F3", skin: "#C98C63", hair: "#3B2820", shirt: "#1B3B36", glasses: false, cap: true },
];

function hashIndex(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h % MEMOJI_THEMES.length;
}

export function MemojiAvatar({
  id = "",
  name = "Traveler",
  size = 28,
}: {
  id?: string;
  name?: string;
  size?: number;
}) {
  const theme = MEMOJI_THEMES[hashIndex(id || name)];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 rounded-full"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="20" fill={theme.bg} />
      {/* Shoulders */}
      <path d="M8 38C8 31.5 13.4 28 20 28C26.6 28 32 31.5 32 38" fill={theme.shirt} />
      {/* Neck */}
      <rect x="17" y="24" width="6" height="6" rx="3" fill={theme.skin} />
      {/* Back Hair */}
      <circle cx="20" cy="17.5" r="10.5" fill={theme.hair} />
      {/* Ears */}
      <circle cx="10.5" cy="19" r="2.2" fill={theme.skin} />
      <circle cx="29.5" cy="19" r="2.2" fill={theme.skin} />
      {/* Face */}
      <rect x="11.5" y="10" width="17" height="17.5" rx="8.5" fill={theme.skin} />
      {/* Front Hair / Cap */}
      {theme.cap ? (
        <>
          <path d="M10.5 15C10.5 9.5 14.5 7 20 7C25.5 7 29.5 9.5 29.5 15H10.5Z" fill={theme.shirt} />
          <path d="M10 14.5H32.5C32.5 15.8 30.5 16.5 28 16.5H10V14.5Z" fill="#1B3B36" />
        </>
      ) : (
        <path
          d="M11.5 16C12 10.5 15.5 8.5 20.5 8.5C25 8.5 28.5 11 28.5 15.5C26 13.2 22.5 12.2 18.5 12.6C15.2 13 13 14.3 11.5 16Z"
          fill={theme.hair}
        />
      )}
      {/* Eyes */}
      <circle cx="16.2" cy="18.6" r="1.25" fill="#1C1917" />
      <circle cx="23.8" cy="18.6" r="1.25" fill="#1C1917" />
      {/* Glasses */}
      {theme.glasses && (
        <g stroke="#1C1917" strokeWidth="1.2" fill="none">
          <rect x="13.2" y="16.5" width="5.8" height="4.2" rx="1.6" />
          <rect x="21" y="16.5" width="5.8" height="4.2" rx="1.6" />
          <path d="M19 18.4H21" />
        </g>
      )}
      {/* Rosy cheeks */}
      <circle cx="14.2" cy="21" r="1.4" fill="#E07A5F" fillOpacity="0.35" />
      <circle cx="25.8" cy="21" r="1.4" fill="#E07A5F" fillOpacity="0.35" />
      {/* Warm Smile */}
      <path
        d="M16.8 22.2C17.8 23.6 22.2 23.6 23.2 22.2"
        stroke="#5C2B1D"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
