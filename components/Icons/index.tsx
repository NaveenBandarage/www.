export function PhosphorIcon({ label, path, size, ...rest }) {
  return (
    <svg
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="currentColor"
      {...rest}
    >
      <path d={path} />
    </svg>
  );
}

export function HomeIcon({ size }) {
  return (
    <PhosphorIcon
      label="Home"
      size={size}
      path="M218.8 103.7l-80-72.7a16 16 0 00-21.6 0l-80 72.7a16 16 0 00-5.2 11.8v92.1a16.4 16.4 0 004 11 15.9 15.9 0 0012 5.4h48a8 8 0 008-8v-48a8 8 0 018-8h32a8 8 0 018 8v48a8 8 0 008 8h48a15.6 15.6 0 007.6-1.9A16.1 16.1 0 00224 208v-92.5a16 16 0 00-5.2-11.8z"
    />
  );
}

export function NoteIcon({ size }) {
  return (
    <PhosphorIcon
      label="Note"
      size={size}
      path="M200 32h-16v-8a8 8 0 00-16 0v8h-32v-8a8 8 0 00-16 0v8H88v-8a8 8 0 00-16 0v8H56a16 16 0 00-16 16v152a32 32 0 0032 32h112a32 32 0 0032-32V48a16 16 0 00-16-16zm-40 136H96a8 8 0 010-16h64a8 8 0 010 16zm0-32H96a8 8 0 010-16h64a8 8 0 010 16z"
    />
  );
}

export function TwitterIcon({ size }) {
  return (
    <PhosphorIcon
      label="Twitter logo"
      size={size}
      path="M245.7 77.7l-30.2 30.1c-6 69.9-65 124.2-135.5 124.2-14.5 0-26.5-2.3-35.6-6.8-7.3-3.7-10.3-7.6-11.1-8.8a8 8 0 013.9-11.9c.2-.1 23.8-9.1 39.1-26.4a108.6 108.6 0 01-24.7-24.4c-13.7-18.6-28.2-50.9-19.5-99.1a8.1 8.1 0 015.5-6.2 8 8 0 018.1 1.9c.3.4 33.6 33.2 74.3 43.8V88a48.3 48.3 0 0148.6-48 48.2 48.2 0 0141 24H240a8 8 0 017.4 4.9 8.4 8.4 0 01-1.7 8.8z"
    />
  );
}

export function XIcon({ size }) {
  return (
    <svg
      aria-label="X logo"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function EmailIcon({ size }) {
  return (
    <PhosphorIcon
      label="Email"
      size={size}
      path="M227.7 48.3l-52.4 185.9a15.9 15.9 0 01-14.1 11.6h-1.4a16 16 0 01-14.4-9.1l-35.7-75.4a4.1 4.1 0 01.8-4.6l51.3-51.3a8 8 0 10-11.3-11.3l-51.3 51.4a4.1 4.1 0 01-4.6.8l-75-35.5a16.6 16.6 0 01-9.5-15.6 15.9 15.9 0 0111.7-14.5l186.3-52.5a16 16 0 0117.7 6.5 16.7 16.7 0 011.9 13.6z"
    />
  );
}

export function ShareIcon({ size }) {
  return (
    <PhosphorIcon
      label="Share"
      size={size}
      path="M229.7 109.7l-48 48a8.3 8.3 0 01-5.7 2.3 8.5 8.5 0 01-3.1-.6 8 8 0 01-4.9-7.4v-40a87.9 87.9 0 00-85.2 66 8.1 8.1 0 01-7.8 6l-2-.3a8 8 0 01-5.7-9.7A103.9 103.9 0 01168 96V56a8 8 0 014.9-7.4 8.4 8.4 0 018.8 1.7l48 48a8.1 8.1 0 010 11.4zM192 208H40V88a8 8 0 00-16 0v120a16 16 0 0016 16h152a8 8 0 000-16z"
    />
  );
}

export function SpinnerIcon({ size }) {
  return (
    <div className="inline-flex animate-spin">
      <PhosphorIcon
        label="Loading..."
        size={size}
        path="M232 128A104 104 0 1184.7 33.4a8.1 8.1 0 0110.6 4 8 8 0 01-4 10.6 88 88 0 1073.4 0 8 8 0 01-4-10.6 8.1 8.1 0 0110.6-4A104.4 104.4 0 01232 128z"
      />
    </div>
  );
}

export function FeedIcon({ size }) {
  return (
    <PhosphorIcon
      label="Feed"
      size={size}
      path="M44 47.992c.004-6.627 5.38-11.996 12.008-11.992A164.1 164.1 0 0 1 220 199.992c.004 6.628-5.365 12.004-11.992 12.008-6.628.004-12.004-5.365-12.008-11.992A140.101 140.101 0 0 0 55.992 60C49.365 59.996 43.996 54.62 44 47.992ZM44 120c0-6.627 5.373-12 12-12a92.008 92.008 0 0 1 65.054 26.946A92.008 92.008 0 0 1 148 200c0 6.627-5.373 12-12 12s-12-5.373-12-12a68.003 68.003 0 0 0-68-68c-6.627 0-12-5.373-12-12ZM72 200c0 8.837-7.163 16-16 16s-16-7.163-16-16 7.163-16 16-16 16 7.163 16 16Z"
    />
  );
}

export function ExternalIcon({ size }) {
  return (
    <PhosphorIcon
      label="Open in new tab"
      size={size}
      path="M76 88c-6.627 0-12-5.373-12-12s5.373-12 12-12h104c6.627 0 12 5.373 12 12v104c0 6.627-5.373 12-12 12s-12-5.373-12-12v-75.029l-83.515 83.514c-4.686 4.687-12.284 4.687-16.97 0-4.687-4.686-4.687-12.284 0-16.97L151.029 88H76Z"
    />
  );
}

export function GithubIcon({ size }) {
  return (
    <PhosphorIcon
      label="GitHub"
      size={size}
      path="M128 0C57.28 0 0 57.28 0 128c0 56.64 36.64 104.48 87.52 121.44 6.4 1.12 8.8-2.72 8.8-6.08 0-3.04-.16-13.12-.16-23.84-32.16 5.92-40.48-7.84-43.04-15.04-1.44-3.68-7.68-15.04-13.12-18.08-4.48-2.4-10.88-8.32-.16-8.48 10.08-.16 17.28 9.28 19.68 13.12 11.52 19.36 29.92 13.92 37.28 10.56 1.12-8.32 4.48-13.92 8.16-17.12-28.48-3.2-58.24-14.24-58.24-63.2 0-13.92 4.96-25.44 13.12-34.4-1.28-3.2-5.76-16.32 1.28-33.92 0 0 10.72-3.36 35.2 13.12 10.24-2.88 21.12-4.32 32-4.32 10.88 0 21.76 1.44 32 4.32 24.48-16.64 35.2-13.12 35.2-13.12 7.04 17.6 2.56 30.72 1.28 33.92 8.16 8.96 13.12 20.32 13.12 34.4 0 49.12-29.92 60-58.4 63.2 4.64 4 8.64 11.68 8.64 23.68 0 17.12-.16 30.88-.16 35.2 0 3.36 2.4 7.36 8.8 6.08A128.203 128.203 0 0 0 256 128C256 57.28 198.72 0 128 0Z"
    />
  );
}

export function MusicIcon({ size }) {
  return (
    <PhosphorIcon
      label="Music note"
      size={size}
      path="M210.3,56.3l-80-24a8.2,8.2,0,0,0-7.1,1.3A8.1,8.1,0,0,0,120,40V148.3A47.4,47.4,0,0,0,88,136a48,48,0,1,0,48,48V98.8l69.7,20.9a8.2,8.2,0,0,0,7.1-1.3A8.1,8.1,0,0,0,216,112V64A8.1,8.1,0,0,0,210.3,56.3Z"
    />
  );
}

export function GlobeIcon({ size }) {
  return (
    <PhosphorIcon
      label="Globe"
      size={size}
      path="M221.6,173.3A102.9,102.9,0,0,0,232,128,104.2,104.2,0,0,0,154.8,27.5h-.5A103.8,103.8,0,0,0,60.4,49l-1.3,1.2A103.9,103.9,0,0,0,128,232h2.4A104.3,104.3,0,0,0,221,174.6h0ZM216,128a89.3,89.3,0,0,1-5.5,30.7l-46.4-28.5a16,16,0,0,0-6.3-2.3l-22.8-3a16.1,16.1,0,0,0-15.3,6.8h-8.6l-3.8-7.9a16.2,16.2,0,0,0-11-8.7l-6.6-1.4,2.5-5.9a8.1,8.1,0,0,1,7.4-4.9h16.1a16.1,16.1,0,0,0,7.7-2l12.2-6.8a16.1,16.1,0,0,0,3-2.1l26.9-24.4A15.7,15.7,0,0,0,170,50.7,88,88,0,0,1,216,128ZM40,128a87.1,87.1,0,0,1,9.5-39.7l10.4,27.9a16.1,16.1,0,0,0,11.6,10l5.5,1.2h.1l12,2.6a7.8,7.8,0,0,1,5.5,4.3l2.1,4.4a16.1,16.1,0,0,0,14.4,9h1.2l-7.7,17.2a15.9,15.9,0,0,0,2.8,17.4l16.1,17.4a8.3,8.3,0,0,1,2,6.9l-1.8,9.3A88.1,88.1,0,0,1,40,128Z"
    />
  );
}

export function CosmosIcon({ size }) {
  return (
    <svg
      aria-label="Cosmos logo"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {/* Top dot */}
      <circle cx="12" cy="4" r="2" />
      {/* Top right dot */}
      <circle cx="18.928" cy="8" r="2" />
      {/* Bottom right dot */}
      <circle cx="18.928" cy="16" r="2" />
      {/* Bottom dot */}
      <circle cx="12" cy="20" r="2" />
      {/* Bottom left dot */}
      <circle cx="5.072" cy="16" r="2" />
      {/* Top left dot */}
      <circle cx="5.072" cy="8" r="2" />
    </svg>
  );
}

export function PixelatedMacIcon({ size = 32, className = "" }) {
  return (
    <svg
      aria-label="Naveen Bandarage"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`pixelated-mac-icon ${className}`}
      style={{
        imageRendering: "pixelated",
        shapeRendering: "crispEdges",
      }}
      fill="currentColor"
    >
      {/* Outer border - Computer frame */}
      <rect x="2" y="2" width="28" height="26" fill="currentColor" />
      <rect x="3" y="3" width="26" height="24" fill="white" />

      {/* Inner border */}
      <rect x="5" y="5" width="22" height="20" fill="currentColor" />
      <rect x="6" y="6" width="20" height="18" fill="white" />

      {/* Screen border */}
      <rect x="8" y="8" width="16" height="14" fill="currentColor" />
      <rect x="9" y="9" width="14" height="12" fill="white" />

      {/* Happy face - Eyes */}
      <rect x="11" y="12" width="2" height="2" fill="currentColor" />
      <rect x="19" y="12" width="2" height="2" fill="currentColor" />

      {/* Nose */}
      <rect x="15" y="15" width="2" height="3" fill="currentColor" />

      {/* Smile */}
      <rect x="12" y="18" width="2" height="1" fill="currentColor" />
      <rect x="14" y="19" width="4" height="1" fill="currentColor" />
      <rect x="18" y="18" width="2" height="1" fill="currentColor" />

      {/* Computer base/stand */}
      <rect x="8" y="24" width="16" height="2" fill="currentColor" />
      <rect x="9" y="26" width="14" height="1" fill="currentColor" />

      {/* Stand feet */}
      <rect x="6" y="28" width="2" height="2" fill="currentColor" />
      <rect x="24" y="28" width="2" height="2" fill="currentColor" />
      <rect x="14" y="29" width="4" height="1" fill="currentColor" />
    </svg>
  );
}

export function ClockIcon({ size }) {
  return (
    <PhosphorIcon
      label="Reading time"
      size={size}
      path="M128 40c-48.6 0-88 39.4-88 88s39.4 88 88 88 88-39.4 88-88-39.4-88-88-88zm0 160c-39.7 0-72-32.3-72-72s32.3-72 72-72 72 32.3 72 72-32.3 72-72 72zm4-104v-16a8 8 0 00-16 0v32c0 2.1.8 4.2 2.3 5.7l21.3 21.3a8 8 0 0011.3-11.3L132 96z"
    />
  );
}

export function LinkedInIcon({ size }) {
  return (
    <PhosphorIcon
      label="LinkedIn"
      size={size}
      path="M218.4 218.4h-37.9v-59.4c0-14.1-.3-32.3-19.7-32.3-19.7 0-22.7 15.4-22.7 31.2v60.5h-37.9V95.9h36.4v16.6h.5c5.1-9.6 17.5-19.7 36-19.7 38.5 0 45.6 25.4 45.6 58.3v67.3zM56.9 79.3c-12.2 0-22.1-9.9-22.1-22.1S44.7 35 56.9 35s22.1 9.9 22.1 22.1-9.9 22.2-22.1 22.2zM75.8 218.4H38V95.9h37.8v122.5zM237.1 0H18.9C8.5 0 0 8.3 0 18.5v218.9c0 10.2 8.5 18.5 18.9 18.5h218.1c10.4 0 18.9-8.3 18.9-18.5V18.5C256 8.3 247.5 0 237.1 0z"
    />
  );
}

export function InstagramIcon({ size }) {
  return (
    <PhosphorIcon
      label="Instagram"
      size={size}
      path="M128 80a48 48 0 1 0 48 48 48.05 48.05 0 0 0-48-48zm0 80a32 32 0 1 1 32-32 32 32 0 0 1-32 32zm64-84a12 12 0 1 1-12-12 12 12 0 0 1 12 12zm-96-68c-22.06 0-35.31.16-44.54 2.08a76.16 76.16 0 0 0-27.41 17.84A76.27 76.27 0 0 0 6.21 55.33C4.29 64.56 4.13 77.81 4.13 99.87v56.26c0 22.06.16 35.31 2.08 44.54a76.16 76.16 0 0 0 17.84 27.41 76.27 76.27 0 0 0 27.41 17.84c9.23 1.92 22.48 2.08 44.54 2.08h56.26c22.06 0 35.31-.16 44.54-2.08a76.16 76.16 0 0 0 27.41-17.84 76.27 76.27 0 0 0 17.84-27.41c1.92-9.23 2.08-22.48 2.08-44.54V99.87c0-22.06-.16-35.31-2.08-44.54a76.16 76.16 0 0 0-17.84-27.41A76.27 76.27 0 0 0 200.38 10.08C191.15 8.16 177.9 8 155.84 8zM208 156.13c0 21.1-.14 33.48-2 42.46a60.61 60.61 0 0 1-14.45 22.39A60.61 60.61 0 0 1 169.21 235c-9 1.86-21.36 2-42.46 2H99.87c-21.1 0-33.48-.14-42.46-2a60.61 60.61 0 0 1-22.39-14.45A60.61 60.61 0 0 1 21 198.59c-1.86-9-2-21.36-2-42.46V99.87c0-21.1.14-33.48 2-42.46a60.61 60.61 0 0 1 14.45-22.39A60.61 60.61 0 0 1 57.41 21c9-1.86 21.36-2 42.46-2h56.26c21.1 0 33.48.14 42.46 2a60.61 60.61 0 0 1 22.39 14.45A60.61 60.61 0 0 1 235 57.41c1.86 9 2 21.36 2 42.46z"
    />
  );
}

export function SpotifyIcon({ size }) {
  return (
    <PhosphorIcon
      label="Spotify"
      size={size}
      path="M128 24C74.98 24 32 66.98 32 120s42.98 96 96 96 96-42.98 96-96-42.98-96-96-96zm44.61 138.38a6 6 0 0 1-8.22 2.23c-22.51-13.75-50.85-16.87-84.24-9.24a6 6 0 0 1-2.46-11.74c36.18-8.28 67.38-4.72 92.69 10.53a6 6 0 0 1 2.23 8.22zm11.73-26.09c-1.46 2.37-4.58 3.12-6.95 1.67-25.8-15.88-65.13-20.47-95.67-11.2a5 5 0 0 1-6.04-3.66 5 5 0 0 1 3.66-6.04c34.74-10.53 78.47-5.43 108.05 12.28a5 5 0 0 1 1.67 6.95zm1.01-27.12c-30.94-18.37-82-20.07-111.56-11.11a7 7 0 0 1-8.44-5.08 7 7 0 0 1 5.08-8.44c33.71-10.23 89.66-8.26 124.84 12.84a7 7 0 0 1 2.56 9.56 7 7 0 0 1-9.56 2.56z"
    />
  );
}

export function BookIcon({ size }) {
  return (
    <PhosphorIcon
      label="Book"
      size={size}
      path="M208 24H72a32 32 0 0 0-32 32v168a8 8 0 0 0 8 8 8 8 0 0 0 8-8V56a16 16 0 0 1 16-16h136a8 8 0 0 0 8-8 8 8 0 0 0-8-8zm24 40H72a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V80a16 16 0 0 0-16-16zm-16 144H88V96h128z"
    />
  );
}

export function NewsletterIcon({ size }) {
  return (
    <svg
      aria-label="Substack logo"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
    >
      {/* Top line */}
      <rect x="10" y="20" width="80" height="8" fill="#FF6719" />
      {/* Middle line */}
      <rect x="10" y="36" width="80" height="8" fill="#FF6719" />
      {/* Bottom banner with triangular notch */}
      <path d="M10 52h80v28L50 68 10 80V52z" fill="#FF6719" />
    </svg>
  );
}

export function YoutubeIcon({ size }) {
  return (
    <PhosphorIcon
      label="YouTube"
      size={size}
      path="M164.44 121.34l-48-32A8 8 0 0 0 104 96v64a8 8 0 0 0 12.44 6.66l48-32a8 8 0 0 0 0-13.32zM120 145.05V111l25.58 17zM234.33 69.52a24 24 0 0 0-14.49-16.4C185.56 39.88 131 40 128 40s-57.56-.12-91.84 13.12a24 24 0 0 0-14.49 16.4C19.08 79.5 16 97.74 16 128s3.08 48.5 5.67 58.48a24 24 0 0 0 14.49 16.4C69.44 216.12 124 216 128 216s58.56.12 92.84-13.12a24 24 0 0 0 14.49-16.4c2.59-10 5.67-28.22 5.67-58.48s-3.08-48.5-5.67-58.48zM220.71 184c-2.65 10.38-4.71 24-4.71 24s-1.91 7.42-7.84 10.7C175.78 232.58 128 232 128 232s-47.78.58-80.16-13.3c-5.93-3.28-7.84-10.7-7.84-10.7s-2.06-13.62-4.71-24C32.91 174.33 32 159.75 32 128s.91-46.33 3.29-56c2.65-10.38 4.71-24 4.71-24s1.91-7.42 7.84-10.7C80.22 23.42 128 24 128 24s47.78-.58 80.16 13.3c5.93 3.28 7.84 10.7 7.84 10.7s2.06 13.62 4.71 24c2.38 9.67 3.29 24.25 3.29 56s-.91 46.33-3.29 56z"
    />
  );
}

export function GoodreadsIcon({ size }) {
  return (
    <svg
      aria-label="Goodreads logo"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.7 7.3c-1.2-1.8-3.1-2.8-5.4-2.8-3.5 0-6.8 3-6.8 8.1 0 4.8 2.9 8.1 7 8.1 2.2 0 4.1-1 5.3-2.8v2.3c0 2.5-1.3 3.8-3.8 3.8-1.9 0-3.1-.7-3.8-2.2l-1.4.6c.9 2.2 2.9 3.2 5.2 3.2 3.5 0 5.4-1.9 5.4-5.4V4.8h-1.7v2.5zM12.3 18.9c-3.2 0-5.3-2.5-5.3-6.5s2.1-6.5 5.3-6.5c3.2 0 5.3 2.5 5.3 6.5s-2.1 6.5-5.3 6.5z" />
    </svg>
  );
}
