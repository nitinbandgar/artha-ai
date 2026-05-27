export default function ArthaLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="14" fill="url(#grad)" />
      {/* Rupee symbol stylised */}
      <text x="10" y="34" fontSize="26" fontWeight="bold" fill="white" fontFamily="Arial">₹</text>
      {/* AI spark top-right */}
      <circle cx="37" cy="11" r="5" fill="white" fillOpacity="0.25" />
      <path d="M37 8v6M34 11h6" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      <defs>
        <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6366f1" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
  );
}
