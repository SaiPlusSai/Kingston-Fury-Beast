import React, { useState, useEffect, useMemo } from 'react';

/**
 * KunturBlob - Symmetrical, Minimalist Geometric Mascot (Grok / OpenAI Style).
 *
 * Designed with perfect mathematical proportions:
 * 1. Clean, organic symmetrical silhouette (no disjointed Picasso distortions).
 * 2. Expressive white pill capsule eyes (parpadeo orgánico, seguimiento y sonrisas ^ ^).
 * 3. Proportional, clean amber condor beak (#F59E0B) centered under the eyes.
 * 4. Elegant white Andean feather ruff collar at the base.
 * 5. Symmetrical condor wings that fold neatly against the body and spread smoothly when opening chat.
 * 6. Dynamic single-color morphing (Teal, Blue, Red, Green, Slate).
 */
export default function KunturBlob({
  state = 'idle',
  expression = 'normal',
  lookAt = 'center',
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
  const [isBlinking, setIsBlinking] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isJiggling, setIsJiggling] = useState(false);
  const [blinkTick, setBlinkTick] = useState(0);

  // Natural random blinking cycle (every 3-6s)
  useEffect(() => {
    const nextBlink = 3000 + Math.random() * 3200;
    const timer = setTimeout(() => {
      setIsBlinking(true);
      const closeTimer = setTimeout(() => {
        setIsBlinking(false);
        setBlinkTick((t) => t + 1);
      }, 150);
      return () => clearTimeout(closeTimer);
    }, nextBlink);

    return () => clearTimeout(timer);
  }, [blinkTick]);

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

  // Darker shade for wings and crest
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

  // Eye movement offsets
  const eyeOffset = useMemo(() => {
    switch (lookAt) {
      case 'left':
        return { x: -3, y: 0 };
      case 'right':
        return { x: 3, y: 0 };
      case 'down':
      case 'typing':
        return { x: 0, y: 3.5 };
      case 'up':
        return { x: 0, y: -2.5 };
      default:
        return { x: 0, y: 0 };
    }
  }, [lookAt]);

  // Effective expression
  const activeExpression = useMemo(() => {
    if (expression !== 'normal') return expression;
    const s = String(state).toUpperCase();
    if (s === 'DONE' || s === 'SUCCESS') return 'happy';
    if (s.includes('EMERGENCY')) return 'alert';
    if (s === 'PROCESSING' || s === 'THINKING') return 'thinking';
    if (isHovered) return 'happy';
    return 'normal';
  }, [state, expression, isHovered]);

  const handleClick = (e) => {
    if (!interactive) return;
    setIsJiggling(true);
    setTimeout(() => setIsJiggling(false), 450);
    onClick?.(e);
  };

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    onMouseLeave?.(e);
  };

  // Dimensions
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    fab: 'w-16 h-16',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  const effectiveWingsOpen = wingsOpen || (isHovered && interactive);

  return (
    <div
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${sizeClass} ${
        isJiggling ? 'scale-110 -rotate-3' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      style={{ willChange: 'transform' }}
    >
      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible drop-shadow-md transition-all duration-300"
      >
        {/* 1. LEFT WING (Symmetrical, pivots outward gracefully) */}
        <g
          className="transition-transform duration-500 ease-out origin-[32px_54px]"
          style={{
            transform: effectiveWingsOpen ? 'rotate(-32deg) translate(-2px, -3px)' : 'rotate(0deg)',
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

        {/* 2. RIGHT WING (Symmetrical, pivots outward gracefully) */}
        <g
          className="transition-transform duration-500 ease-out origin-[88px_54px]"
          style={{
            transform: effectiveWingsOpen ? 'rotate(32deg) translate(2px, -3px)' : 'rotate(0deg)',
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
             C 57 16, 63 16, 63 22 Z"
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

        {/* 6. EXPRESSIVE CAPSULE EYES (Grok / OpenAI style) */}
        <g
          className="transition-transform duration-200"
          style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
          }}
        >
          {/* LEFT EYE */}
          {activeExpression === 'happy' ? (
            <path
              d="M 46 48 Q 50.5 40 55 48"
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
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '18' : '15'}
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
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="66"
              y="38"
              width="7"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '18' : '15'}
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
