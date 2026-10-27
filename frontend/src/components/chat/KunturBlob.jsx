import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * KunturBlob - Highly Interactive Andean Condor Mascot (Grok / OpenAI Style).
 *
 * Capabilities:
 * 1. Global Mouse Cursor Eye Tracking: Kuntur follows the user's mouse across the screen!
 * 2. Responsive Sizing: Optimized for Mobile (80px), Tablet (96px), Desktop (112px), and 4K (128px).
 * 3. Proactive Idle Gestures: Periodic wing flutters and friendly winks every ~10s.
 * 4. Sleep Mode: Gently closes eyes into sleepy arcs if inactive for >20s, wakes up when mouse moves.
 * 5. Elastic Physics (Squash & Stretch): Organic jelly bounce on click and hover.
 * 6. Authentic Minimalist Condor Anatomy: Symmetrical organic body, amber hooked beak (#F59E0B), white collar ruff, and responsive wings.
 */
export default function KunturBlob({
  state = 'idle',
  expression = 'normal',
  lookAt = 'center',
  trackCursor = false,
  isSpeaking = false,
  wingsOpen = false,
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
  const [periodicGesture, setPeriodicGesture] = useState(null); // 'wink' | 'flutter' | null
  const [blinkTick, setBlinkTick] = useState(0);

  // Mouse tracking vector for eyes
  const [cursorOffset, setCursorOffset] = useState({ x: 0, y: 0 });

  // 1. GLOBAL CURSOR TRACKING
  useEffect(() => {
    if (!trackCursor) return;

    let idleTimer = null;

    const handleMouseMove = (e) => {
      // Wake up if asleep
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

      // Smooth clamp to ±4.5px in X and ±3.5px in Y
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

  // 3. PERIODIC PROACTIVE GESTURES (WINK / FLUTTER EVERY ~12S)
  useEffect(() => {
    if (!interactive || isSleepy) return;

    const interval = setInterval(() => {
      const gesture = Math.random() > 0.5 ? 'wink' : 'flutter';
      setPeriodicGesture(gesture);

      setTimeout(() => {
        setPeriodicGesture(null);
      }, 1200);
    }, 11000 + Math.random() * 4000);

    return () => clearInterval(interval);
  }, [interactive, isSleepy]);

  // Color mapping per FSM state
  const bodyColor = useMemo(() => {
    if (colorOverride) return colorOverride;
    const s = String(state).toUpperCase();

    if (s.includes('EMERGENCY') || s.includes('ROBO') || s.includes('INCENDIO') || s.includes('ACCIDENTE') || s.includes('ALERT')) {
      return '#DC2626'; // Alert Red
    }
    if (s === 'PROCESSING' || s === 'TYPING' || s === 'THINKING' || s === 'SEARCH') {
      return '#0284C7'; // Electric Sky Blue
    }
    if (s === 'DONE' || s === 'SUCCESS' || s === 'CONFIRM') {
      return '#16A34A'; // Emerald Green
    }
    if (s === 'ASK_CATEGORY' || s === 'ASK_LOCATION') {
      return '#D97706'; // Focused Amber
    }
    return '#0F766E'; // Signature HALO Forest Teal
  }, [state, colorOverride]);

  const wingColor = useMemo(() => {
    switch (bodyColor) {
      case '#DC2626':
        return '#991B1B';
      case '#0284C7':
        return '#0369A1';
      case '#16A34A':
        return '#15803D';
      case '#D97706':
        return '#B45309';
      default:
        return '#115E59';
    }
  }, [bodyColor]);

  // Effective eye offset
  const finalEyeOffset = useMemo(() => {
    if (trackCursor) {
      return cursorOffset;
    }
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

  // Effective facial expression
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

  // Dimensions: Enhanced responsive sizing for all devices (Mobile to 4K)
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    // Mobile: 80px (w-20), Tablet: 96px (sm:w-24), Desktop: 112px (lg:w-28), Large Screens: 128px (xl:w-32)
    'responsive-fab': 'w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  const isWingsFlapping = wingsOpen || (isHovered && interactive) || periodicGesture === 'flutter';

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
      {/* Optimized viewBox='0 10 120 92' eliminates wasted vertical whitespace, maximizing mascot scale by +28% */}
      <svg
        viewBox="0 10 120 92"
        className="w-full h-full overflow-visible drop-shadow-lg transition-all duration-300"
      >
        {/* 1. LEFT WING (Symmetrical, pivots outward gracefully on open/flutter) */}
        <g
          className="transition-transform duration-500 ease-out origin-[32px_54px]"
          style={{
            transform: isWingsFlapping ? 'rotate(-34deg) translate(-2px, -3px)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M 32 50
               C 22 55, 16 68, 20 80
               C 24 81, 28 75, 32 78
               C 34 68, 34 58, 32 50 Z"
            fill={wingColor}
            className="transition-colors duration-500"
          />
        </g>

        {/* 2. RIGHT WING (Symmetrical, pivots outward gracefully on open/flutter) */}
        <g
          className="transition-transform duration-500 ease-out origin-[88px_54px]"
          style={{
            transform: isWingsFlapping ? 'rotate(34deg) translate(2px, -3px)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M 88 50
               C 98 55, 104 68, 100 80
               C 96 81, 92 75, 88 78
               C 86 68, 86 58, 88 50 Z"
            fill={wingColor}
            className="transition-colors duration-500"
          />
        </g>

        {/* 3. SUBTLE ANDEAN CREST (Tiny, aerodynamic on crown) */}
        <path
          d="M 57 22
             C 57 15, 63 15, 63 22 Z"
          fill={wingColor}
          className="transition-colors duration-500"
        />

        {/* 4. MAIN BODY (Perfect symmetrical organic rounded condor blob) */}
        <path
          d="M 60 22
             C 82 22, 90 36, 90 58
             C 90 80, 78 92, 60 92
             C 42 92, 30 80, 30 58
             C 30 36, 38 22, 60 22 Z"
          fill={bodyColor}
          className="transition-colors duration-500"
        />

        {/* 5. WHITE ANDEAN COLLAR (Gorguera blanca limpia y simétrica en la base) */}
        <path
          d="M 45 80
             C 55 86, 65 86, 75 80
             C 67 88, 53 88, 45 80 Z"
          fill="#FFFFFF"
          className="drop-shadow-2xs"
        />

        {/* 6. EXPRESSIVE CAPSULE EYES (Tracks Mouse Cursor & Emotes) */}
        <g
          className="transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${finalEyeOffset.x}px, ${finalEyeOffset.y}px)`,
          }}
        >
          {/* LEFT EYE */}
          {activeExpression === 'happy' ? (
            <path
              d="M 46 48 Q 50.5 40 55 48"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : activeExpression === 'sleepy' ? (
            <path
              d="M 46 46 Q 50.5 50 55 46"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="47"
              y="38"
              width="7"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '19' : '15'}
              rx="3.5"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[50.5px_45.5px]"
            />
          )}

          {/* RIGHT EYE */}
          {activeExpression === 'happy' || activeExpression === 'wink' ? (
            <path
              d="M 65 48 Q 69.5 40 74 48"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : activeExpression === 'sleepy' ? (
            <path
              d="M 65 46 Q 69.5 50 74 46"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="66"
              y="38"
              width="7"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '19' : '15'}
              rx="3.5"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[69.5px_45.5px]"
            />
          )}
        </g>

        {/* 7. PROPORTIONAL, CUTE CONDOR BEAK (Centered, warm amber #F59E0B) */}
        <g
          className="transition-transform duration-150 origin-[60px_56px]"
          style={{
            transform: isSpeaking ? 'translateY(2.5px) scaleY(1.15)' : 'translateY(0)',
          }}
        >
          {/* Main beak body */}
          <path
            d="M 55 56
               C 55 54.5, 65 54.5, 65 56
               C 65 60.5, 62.5 67, 60 69
               C 57.5 67, 55 60.5, 55 56 Z"
            fill="#F59E0B"
            className="filter drop-shadow-2xs"
          />

          {/* Subtle upper ridge shadow */}
          <path
            d="M 57 56
               C 57 55, 63 55, 63 56
               C 63 58, 61.5 60, 60 61
               C 58.5 60, 57 58, 57 56 Z"
            fill="#D97706"
          />
        </g>
      </svg>
    </div>
  );
}
