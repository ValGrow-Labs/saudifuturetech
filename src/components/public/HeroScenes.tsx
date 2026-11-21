import React from 'react';

export const SceneS1: React.FC = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    overflow="hidden"
    style={{ overflow: 'hidden' }}
    className="w-full h-full object-cover block"
  >
    <defs>
      <linearGradient id="sft-g1" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b2a41" />
        <stop offset="0.6" stopColor="#8a5a4a" />
        <stop offset="1" stopColor="#eaa75e" />
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sft-g1)" />
    <circle cx="1150" cy="620" r="95" fill="#f7cc85" opacity="0.9" />
    <g fill="#0e1828">
      <rect x="60" y="640" width="110" height="260" />
      <rect x="190" y="560" width="90" height="340" />
      <path d="M520 900V340Q565 270 610 340V900Z" />
      <rect x="640" y="520" width="120" height="380" />
      <circle cx="830" cy="470" r="34" />
      <rect x="822" y="490" width="16" height="410" />
      <rect x="900" y="590" width="100" height="310" />
      <rect x="1020" y="470" width="80" height="430" />
      <rect x="1120" y="640" width="140" height="260" />
      <rect x="1280" y="540" width="90" height="360" />
      <rect x="1390" y="620" width="150" height="280" />
    </g>
    <g fill="#ffd98a">
      <rect className="animate-hero-tw" x="540" y="420" width="6" height="8" />
      <rect className="animate-hero-tw" x="580" y="500" width="6" height="8" style={{ animationDelay: '0.7s' }} />
      <rect className="animate-hero-tw" x="670" y="580" width="6" height="8" style={{ animationDelay: '1.2s' }} />
      <rect className="animate-hero-tw" x="1045" y="540" width="6" height="8" style={{ animationDelay: '0.3s' }} />
      <rect className="animate-hero-tw" x="1310" y="620" width="6" height="8" style={{ animationDelay: '1.6s' }} />
      <rect className="animate-hero-tw" x="210" y="640" width="6" height="8" style={{ animationDelay: '2s' }} />
    </g>
  </svg>
);

export const SceneS2: React.FC = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    overflow="hidden"
    style={{ overflow: 'hidden' }}
    className="w-full h-full object-cover block"
  >
    <defs>
      <linearGradient id="sft-g2" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#14233a" />
        <stop offset="0.55" stopColor="#3f6f73" />
        <stop offset="1" stopColor="#e6c48a" />
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sft-g2)" />
    <g fill="#ffffff">
      <circle className="animate-hero-tw" cx="200" cy="120" r="2" />
      <circle className="animate-hero-tw" cx="640" cy="80" r="2" style={{ animationDelay: '1s' }} />
      <circle className="animate-hero-tw" cx="1100" cy="150" r="2" style={{ animationDelay: '0.5s' }} />
      <circle className="animate-hero-tw" cx="1400" cy="90" r="2" style={{ animationDelay: '1.8s' }} />
    </g>
    <path className="animate-hero-sway" d="M-100 620Q300 480 700 600T1700 560V900H-100Z" fill="#c99a62" opacity="0.8" />
    <path className="animate-hero-sway" d="M-100 700Q400 560 900 690T1700 650V900H-100Z" fill="#a87647" style={{ animationDuration: '18s' }} />
    <path d="M-100 800Q500 700 1000 790T1700 770V900H-100Z" fill="#6e4a2f" />
  </svg>
);

export const SceneS3: React.FC = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    overflow="hidden"
    style={{ overflow: 'hidden' }}
    className="w-full h-full object-cover block"
  >
    <rect width="1600" height="900" fill="#12202f" />
    <g stroke="#3fa796" strokeWidth="1.5" fill="none" opacity="0.7">
      <path className="animate-hero-flow" d="M200 700L480 440L820 520L1100 300L1420 400" />
      <path className="animate-hero-flow" d="M480 440L560 220L820 520" />
      <path className="animate-hero-flow" d="M820 520L900 760L1250 680L1420 400" />
      <path className="animate-hero-flow" d="M1100 300L1250 680" />
    </g>
    <g fill="#c4a265">
      <circle className="animate-hero-pl" cx="200" cy="700" r="9" />
      <circle className="animate-hero-pl" cx="480" cy="440" r="11" style={{ animationDelay: '0.5s' }} />
      <circle className="animate-hero-pl" cx="820" cy="520" r="14" style={{ animationDelay: '1s' }} />
      <circle className="animate-hero-pl" cx="1100" cy="300" r="11" style={{ animationDelay: '1.5s' }} />
      <circle className="animate-hero-pl" cx="1420" cy="400" r="9" style={{ animationDelay: '0.8s' }} />
      <circle className="animate-hero-pl" cx="560" cy="220" r="8" style={{ animationDelay: '0.3s' }} />
      <circle className="animate-hero-pl" cx="900" cy="760" r="8" style={{ animationDelay: '1.2s' }} />
      <circle className="animate-hero-pl" cx="1250" cy="680" r="10" style={{ animationDelay: '1.9s' }} />
    </g>
  </svg>
);

export const SceneS4: React.FC = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    overflow="hidden"
    style={{ overflow: 'hidden' }}
    className="w-full h-full object-cover block"
  >
    <defs>
      <linearGradient id="sft-g4" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1b2a41" />
        <stop offset="0.5" stopColor="#d98c5f" />
        <stop offset="1" stopColor="#f6cf8f" />
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sft-g4)" />
    <circle cx="800" cy="470" r="80" fill="#fff3c9" opacity="0.9" />
    <rect y="500" width="1600" height="400" fill="#0f4c5c" />
    <g className="animate-hero-bob">
      <path d="M1000 560h140l-20 24h-100z" fill="#0e1828" />
      <path d="M1070 560V480l50 80z" fill="#0e1828" />
    </g>
    <path className="animate-hero-sway" d="M-100 620Q200 590 500 620T1100 620T1700 620V900H-100Z" fill="#1d7a86" opacity="0.8" />
    <path className="animate-hero-sway" d="M-100 720Q300 690 700 720T1500 720T1900 720V900H-100Z" fill="#136070" style={{ animationDuration: '12s' }} />
    <path d="M-100 820Q400 790 900 820T1700 820V900H-100Z" fill="#0b3f4d" />
  </svg>
);

export const SceneS5: React.FC = () => (
  <svg
    viewBox="0 0 1600 900"
    preserveAspectRatio="xMidYMid slice"
    overflow="hidden"
    style={{ overflow: 'hidden' }}
    className="w-full h-full object-cover block"
  >
    <defs>
      <linearGradient id="sft-g5" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#16304f" />
        <stop offset="0.6" stopColor="#5f8fb8" />
        <stop offset="1" stopColor="#f3c98b" />
      </linearGradient>
    </defs>
    <rect width="1600" height="900" fill="url(#sft-g5)" />
    <g fill="#ffffff" opacity="0.55">
      <ellipse className="animate-hero-cloud" cx="300" cy="560" rx="160" ry="34" />
      <ellipse className="animate-hero-cloud" cx="700" cy="680" rx="220" ry="40" style={{ animationDuration: '60s' }} />
    </g>
    <g transform="translate(0,300)">
      <g className="animate-hero-plane">
        <ellipse rx="95" ry="13" fill="#ffffff" />
        <path d="M-80 -4L-105 -40L-88 -40L-55 -4Z" fill="#dfe8f1" />
        <path d="M-10 4L-45 48L-22 48L30 4Z" fill="#cfdbe8" />
        <path d="M-10 -4L-40 -34L-22 -34L30 -4Z" fill="#e8eef5" />
      </g>
    </g>
  </svg>
);
