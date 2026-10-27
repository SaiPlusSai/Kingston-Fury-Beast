import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * ZeoBlob - Minimalist Geometric Zebra Mascot for HALO La Paz (Grok / OpenAI Style).
 * Represents the iconic "Cebras de La Paz" - ambassadors of civic culture and safety.
 *
 * Capabilities:
 * 1. Global Mouse Cursor Eye Tracking: Zeo follows the user's cursor across the screen.
 * 2. Ear Wiggle Gestures: Ears wiggle playfully on hover and periodic idle gestures.
 * 3. Responsive Sizing: Optimized from Mobile (80px) to 4K displays (128px).
 * 4. Sleep Mode & Organic Blinking.
 * 5. Muzzle articulation when speaking.
 * 6. Symmetrical Black & White Zebra stripes with dynamic alert accent colors.
 */
export default function ZeoBlob({
  state = 'idle',
  expression = 'normal',
  lookAt = 'center',
  trackCursor = false,
  isSpeaking = false,
  wingsOpen = false, // Shared prop with Kuntur, triggers happy ear wiggle
  size = 'md',
  colorOverride = null,
  interactive = true,
  className = '',
  onClick,
  onMouseEnter,
  onMouseLeave,
}) {
  const containerRef = useRef(null);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isJiggling, setIsJiggling] = useState(false);
  const [isSleepy, setIsSleepy] = useState(false);
  const [periodicGesture, setPeriodicGesture] = useState(null); // 'wink' | 'wiggle'
  const [blinkTick, setBlinkTick] = useState(0);

  // Mouse tracking vector for eyes
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  // 1. GLOBAL CURSOR TRACKING
  useEffect(() => {
    if (!trackCursor) return;

    let idleTimer = null;

    const handleMouseMove = (e) => {
      setIsSleepy(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsSleepy(true);
      }, 22000);

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const maxDist = Math.max(window.innerWidth, window.innerHeight) / 2;
      const clampedX = Math.max(-4.5, Math.min(4.5, (deltaX / maxDist) * 12));
      const clampedY = Math.max(-3.5, Math.min(3.5, (deltaY / maxDist) * 10));

      setCursorOffset({ x: clampedX, y: clampedY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    idleTimer = setTimeout(() => setIsSleepy(true), 22000);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer);
    };
  }, [trackCursor]);

  // 2. NATURAL RANDOM BLINKING
  useEffect(() => {
    if (isSleepy) return;
    const nextBlink = 2800 + Math.random() * 3200;
    const timer = setTimeout(() => {
      setIsBlinking(true);
      const closeTimer = setTimeout(() => {
        setIsBlinking(false);
        setBlinkTick((t) => t + 1);
      }, 140);
      return () => clearTimeout(closeTimer);
    }, nextBlink);

    return () => clearTimeout(timer);
  }, [blinkTick, isSleepy]);

  // 3. PERIODIC IDLE GESTURES (WINK / EAR WIGGLE)
  useEffect(() => {
    if (!interactive || isSleepy) return;

    const interval = setInterval(() => {
      const gesture = Math.random() > 0.5 ? 'wink' : 'wiggle';
      setPeriodicGesture(gesture);

      setTimeout(() => {
        setPeriodicGesture(null);
      }, 1200);
    }, 11000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [interactive, isSleepy]);

  // Reactive state accent color (for muzzle / stripes highlight)
  const accentColor = useMemo(() => {
    if (colorOverride) return colorOverride;
    const s = String(state).toUpperCase();

    if (s.includes('EMERGENCY') || s.includes('ROBO') || s.includes('INCENDIO') || s.includes('ACCIDENTE') || s.includes('ALERT')) {
      return '#DC2626'; // Alert Red
    }
    if (s === 'PROCESSING' || s === 'TYPING' || s === 'THINKING' || s === 'SEARCH') {
      return '#0284C7'; // Sky Blue
    }
    if (s === 'DONE' || s === 'SUCCESS' || s === 'CONFIRM') {
      return '#16A34A'; // Emerald Green
    }
    if (s === 'ASK_CATEGORY' || s === 'ASK_LOCATION') {
      return '#D97706'; // Amber
    }
    return '#18181B'; // Charcoal Black for classic Zebra
  }, [state, colorOverride]);

  // Eye movement offsets
  const finalEyeOffset = useMemo(() => {
    if (trackCursor) return cursorOffset;
    switch (lookAt) {
      case 'left':
        return { x: -3.5, y: 0 };
      case 'right':
        return { x: 3.5, y: 0 };
      case 'down':
      case 'typing':
        return { x: 0, y: 3.5 };
      case 'up':
        return { x: 0, y: -2.5 };
      default:
        return { x: 0, y: 0 };
    }
  }, [trackCursor, cursorOffset, lookAt]);

  // Facial expression
  const activeExpression = useMemo(() => {
    if (isSleepy) return 'sleepy';
    if (periodicGesture === 'wink') return 'wink';
    if (expression !== 'normal') return expression;
    const s = String(state).toUpperCase();
    if (s === 'DONE' || s === 'SUCCESS') return 'happy';
    if (s.includes('EMERGENCY')) return 'alert';
    if (s === 'PROCESSING' || s === 'THINKING') return 'thinking';
    if (isHovered) return 'happy';
    return 'normal';
  }, [isSleepy, periodicGesture, expression, state, isHovered]);

  const handleClick = (e) => {
    if (!interactive) return;
    setIsSleepy(false);
    setIsJiggling(true);
    setTimeout(() => setIsJiggling(false), 500);
    onClick?.(e);
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    setIsSleepy(false);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  // Responsive dimensions
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    'responsive-fab': 'w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  const isEarWiggling = wingsOpen || (isHovered && interactive) || periodicGesture === 'wiggle';

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${sizeClass} ${
        isJiggling ? 'scale-115 -rotate-3' : 'hover:scale-108 active:scale-92'
      } ${className}`}
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 10 120 92"
        className="w-full h-full overflow-visible drop-shadow-lg transition-all duration-300"
      >
        {/* 1. LEFT ZEBRA EAR (Wiggles on hover / gesture) */}
        <g
          className="transition-transform duration-300 ease-out origin-[38px_24px]"
          style={{
            transform: isEarWiggling ? 'rotate(-24deg) scale(1.1)' : 'rotate(0deg)',
          }}
        >
          {/* Outer Ear */}
          <path
            d="M 38 24
               C 30 10, 44 4, 48 18 Z"
            fill="#18181B"
          />
          {/* Inner Pinkish/Warm Ear */}
          <path
            d="M 39 22
               C 34 14, 42 10, 45 18 Z"
            fill="#FDA4AF"
          />
        </g>

        {/* 2. RIGHT ZEBRA EAR (Wiggles on hover / gesture) */}
        <g
          className="transition-transform duration-300 ease-out origin-[82px_24px]"
          style={{
            transform: isEarWiggling ? 'rotate(24deg) scale(1.1)' : 'rotate(0deg)',
          }}
        >
          {/* Outer Ear */}
          <path
            d="M 82 24
               C 90 10, 76 4, 72 18 Z"
            fill="#18181B"
          />
          {/* Inner Pinkish/Warm Ear */}
          <path
            d="M 81 22
               C 86 14, 78 10, 75 18 Z"
            fill="#FDA4AF"
          />
        </g>

        {/* 3. ZEBRA MANE (Mohican crest on crown) */}
        <path
          d="M 56 12
             C 58 6, 62 6, 64 12
             L 64 24
             L 56 24 Z"
          fill="#18181B"
        />
        {/* White stripe in mane */}
        <path
          d="M 58 10 L 62 10 L 62 18 L 58 18 Z"
          fill="#FFFFFF"
        />

        {/* 4. MAIN BODY (Pure White Symmetrical Blob) */}
        <path
          d="M 60 22
             C 82 22, 90 36, 90 58
             C 90 80, 78 92, 60 92
             C 42 92, 30 80, 30 58
             C 30 36, 38 22, 60 22 Z"
          fill="#FFFFFF"
          className="drop-shadow-xs"
        />

        {/* 5. ICONIC ZEBRA STRIPES */}
        {/* Left Cheek Stripes */}
        <path
          d="M 30 42 C 38 44, 44 48, 46 50 C 44 51, 36 47, 30 46 Z"
          fill="#18181B"
        />
        <path
          d="M 30 54 C 38 56, 44 60, 46 62 C 44 63, 36 59, 30 58 Z"
          fill="#18181B"
        />

        {/* Right Cheek Stripes */}
        <path
          d="M 90 42 C 82 44, 76 48, 74 50 C 76 51, 84 47, 90 46 Z"
          fill="#18181B"
        />
        <path
          d="M 90 54 C 82 56, 76 60, 74 62 C 76 63, 84 59, 90 58 Z"
          fill="#18181B"
        />

        {/* Forehead V-Stripe */}
        <path
          d="M 57 24 L 63 24 L 61 32 L 59 32 Z"
          fill="#18181B"
        />

        {/* Base Body Stripes */}
        <path
          d="M 36 78 C 44 80, 52 82, 54 84 C 50 85, 42 83, 36 82 Z"
          fill="#18181B"
        />
        <path
          d="M 84 78 C 76 80, 68 82, 66 84 C 70 85, 78 83, 84 82 Z"
          fill="#18181B"
        />

        {/* 6. EXPRESSIVE CAPSULE EYES */}
        <g
          className="transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${finalEyeOffset.x}px, ${finalEyeOffset.y}px)`,
          }}
        >
          {/* LEFT EYE */}
          {activeExpression === 'happy' ? (
            <path
              d="M 46 46 Q 50.5 38 55 46"
              fill="none"
              stroke="#18181B"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : activeExpression === 'sleepy' ? (
            <path
              d="M 46 44 Q 50.5 48 55 44"
              fill="none"
              stroke="#18181B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="47"
              y="36"
              width="7"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '19' : '15'}
              rx="3.5"
              fill="#18181B"
              className="transition-all duration-150 origin-[50.5px_43.5px]"
            />
          )}

          {/* RIGHT EYE */}
          {activeExpression === 'happy' || activeExpression === 'wink' ? (
            <path
              d="M 65 46 Q 69.5 38 74 46"
              fill="none"
              stroke="#18181B"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : activeExpression === 'sleepy' ? (
            <path
              d="M 65 44 Q 69.5 48 74 44"
              fill="none"
              stroke="#18181B"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="66"
              y="36"
              width="7"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '19' : '15'}
              rx="3.5"
              fill="#18181B"
              className="transition-all duration-150 origin-[69.5px_43.5px]"
            />
          )}
        </g>

        {/* 7. ZEBRA SNOUT / MUZZLE (Articulates when speaking) */}
        <g
          className="transition-transform duration-150 origin-[60px_66px]"
          style={{
            transform: isSpeaking ? 'translateY(2.5px) scaleY(1.15)' : 'translateY(0)',
          }}
        >
          {/* Muzzle Body */}
          <path
            d="M 48 58
               C 48 54, 72 54, 72 58
               C 72 68, 66 73, 60 73
               C 54 73, 48 68, 48 58 Z"
            fill={accentColor}
            className="transition-colors duration-500 filter drop-shadow-2xs"
          />

          {/* Nostrils */}
          <ellipse cx="55" cy="64" rx="1.8" ry="2.4" fill="#FFFFFF" opacity="0.8" />
          <ellipse cx="65" cy="64" rx="1.8" ry="2.4" fill="#FFFFFF" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
