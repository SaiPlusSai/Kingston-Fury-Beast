import React, { useState, useEffect, useMemo } from 'react';

/**
 * KunturBlob - Authentic Andean Condor Mascot in Minimalist Vector Style.
 *
 * Distinctive Condor Features:
 * 1. Prominent hooked condor beak with ivory/bone tip and articulated lower jaw.
 * 2. Condor crest (carúncula) on the crown.
 * 3. Iconic fluffy white Andean collar (gorguera) at the neck.
 * 4. Animated condor wings that spread open on click/transition and flutter on hover!
 * 5. Organic eye blinking, eye tracking, and facial expressions (wink, happy, alert, thinking).
 * 6. Dynamic single-color body morphing (Teal, Blue, Red, Green, Slate).
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

  // Natural random blinking cycle
  useEffect(() => {
    const nextBlink = 3200 + Math.random() * 3200;
    const timer = setTimeout(() => {
      setIsBlinking(true);
      const closeTimer = setTimeout(() => {
        setIsBlinking(false);
        setBlinkTick((t) => t + 1);
      }, 160);
      return () => clearTimeout(closeTimer);
    }, nextBlink);

    return () => clearTimeout(timer);
  }, [blinkTick]);

  // Color mapping per state
  const bodyColor = useMemo(() => {
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
      return '#D97706'; // Focused Amber
    }
    return '#0F766E'; // Signature HALO Forest Teal
  }, [state, colorOverride]);

  // Darker shade for wings and crest
  const wingColor = useMemo(() => {
    switch (bodyColor) {
      case '#DC2626':
        return '#B91C1C';
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

  // Beak base color (charcoal/cere) and ivory tip
  const beakCereColor = '#334155';
  const beakTipColor = '#F8FAFC';

  // Eye movement coordinates
  const eyeOffset = useMemo(() => {
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

  // Dimensions by size
  const sizeMap = {
    sm: 'w-9 h-9',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
    fab: 'w-16 h-16', // Ideal for standalone floating launcher
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
        <defs>
          <filter id="kunturShadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.18" />
          </filter>
        </defs>

        {/* 1. LEFT WING (Flaps out smoothly when wingsOpen or hovered) */}
        <g
          className="transition-transform duration-500 ease-out origin-[38px_54px]"
          style={{
            transform: effectiveWingsOpen ? 'rotate(-38deg) translate(-2px, -4px)' : 'rotate(0deg)',
          }}
        >
          {/* Wing silhouette with 3 feather tips */}
          <path
            d="M 38 52
               C 26 56, 18 70, 22 84
               C 24 85, 27 80, 29 83
               C 31 79, 34 77, 36 81
               C 39 74, 40 64, 38 52 Z"
            fill={wingColor}
            className="transition-colors duration-500"
          />
        </g>

        {/* 2. RIGHT WING (Flaps out smoothly when wingsOpen or hovered) */}
        <g
          className="transition-transform duration-500 ease-out origin-[82px_54px]"
          style={{
            transform: effectiveWingsOpen ? 'rotate(38deg) translate(2px, -4px)' : 'rotate(0deg)',
          }}
        >
          {/* Wing silhouette with 3 feather tips */}
          <path
            d="M 82 52
               C 94 56, 102 70, 98 84
               C 96 85, 93 80, 91 83
               C 89 79, 86 77, 84 81
               C 81 74, 80 64, 82 52 Z"
            fill={wingColor}
            className="transition-colors duration-500"
          />
        </g>

        {/* 3. CONDOR CREST (Carúncula en la corona - Rasgo clave del cóndor) */}
        <path
          d="M 54 22
             C 52 11, 63 9, 67 15
             C 71 20, 68 24, 64 25 Z"
          fill={wingColor}
          className="transition-colors duration-500"
        />

        {/* 4. MAIN BODY SILHOUETTE (Gota orgánica estilizada) */}
        <path
          d="M 60 22
             C 80 22, 92 38, 92 64
             C 92 84, 78 98, 60 98
             C 42 98, 28 84, 28 64
             C 28 38, 40 22, 60 22 Z"
          fill={bodyColor}
          className="transition-colors duration-500"
        />

        {/* 5. ANDEAN WHITE RUFF / GORGUERA (El icónico collar blanco esponjoso) */}
        <path
          d="M 36 82
             Q 44 91 52 85
             Q 60 93 68 85
             Q 76 91 84 82
             Q 60 102 36 82 Z"
          fill="#FFFFFF"
          className="drop-shadow-xs"
        />

        {/* 6. EXPRESSIVE CAPSULE EYES */}
        <g
          className="transition-transform duration-200"
          style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
          }}
        >
          {/* LEFT EYE */}
          {activeExpression === 'happy' ? (
            <path
              d="M 40 44 Q 45 35 50 44"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="42"
              y="32"
              width="8"
              height={isBlinking ? '2' : activeExpression === 'alert' ? '19' : '15'}
              rx="4"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[46px_40px]"
            />
          )}

          {/* RIGHT EYE */}
          {activeExpression === 'happy' || activeExpression === 'wink' ? (
            <path
              d="M 70 44 Q 75 35 80 44"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="70"
              y="32"
              width="8"
              height={isBlinking ? '2' : activeExpression === 'alert' ? '19' : '15'}
              rx="4"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[74px_40px]"
            />
          )}
        </g>

        {/* 7. AUTHENTIC HOOKED CONDOR BEAK (Pico ganchudo de rapaz) */}
        <g
          className="transition-transform duration-150 origin-[60px_54px]"
          style={{
            transform: isSpeaking ? 'translateY(3px) scaleY(1.15)' : 'translateY(0)',
          }}
        >
          {/* Lower jaw (visible when talking) */}
          <path
            d="M 53 62
               C 56 68, 64 68, 67 62 Z"
            fill="#64748B"
          />

          {/* Upper hooked mandible base (cere) */}
          <path
            d="M 48 50
               C 48 48, 72 48, 72 50
               C 72 59, 68 64, 60 65
               C 52 64, 48 59, 48 50 Z"
            fill={beakCereColor}
          />

          {/* Distinctive curved raptor beak tip (ivory hooked claw) */}
          <path
            d="M 50 54
               C 50 53, 70 53, 70 54
               C 70 63, 67 74, 60 76
               C 57 73, 50 63, 50 54 Z"
            fill={beakTipColor}
            className="filter drop-shadow-2xs"
          />

          {/* Hook curve accent line */}
          <path
            d="M 59 55 L 59 70 C 59 74, 60 75, 60 75"
            fill="none"
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />
        </g>
      </svg>
    </div>
  );
}
