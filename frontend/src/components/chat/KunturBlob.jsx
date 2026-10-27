import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * KunturBlob - Ultra-minimalist geometric mascot inspired by Grok / OpenAI blob bots.
 * 100% programmatic SVG & CSS. 0 KB images. Infinite scalability.
 *
 * Capabilities:
 * - Natural random blinking (every 3-6s).
 * - Looking direction (center, left, right, down at input).
 * - Facial expressions (normal, wink, happy, alert, thinking).
 * - Animated beak that opens when speaking / streaming.
 * - Dynamic single-color morphing (teal, cyan, amber/red, emerald, slate).
 * - Jelly squash & stretch bounce on click/hover.
 */
export default function KunturBlob({
  state = 'idle',
  expression = 'normal',
  lookAt = 'center',
  isSpeaking = false,
  size = 'md',
  colorOverride = null,
  interactive = true,
  className = '',
  onClick,
}) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isJiggling, setIsJiggling] = useState(false);
  const [blinkTick, setBlinkTick] = useState(0);

  // Random natural blink cycle
  useEffect(() => {
    const nextBlinkDelay = 3000 + Math.random() * 3500;
    const timeout = setTimeout(() => {
      setIsBlinking(true);
      const closeTimeout = setTimeout(() => {
        setIsBlinking(false);
        setBlinkTick((t) => t + 1);
      }, 150);
      return () => clearTimeout(closeTimeout);
    }, nextBlinkDelay);

    return () => clearTimeout(timeout);
  }, [blinkTick]);

  // Color mapping according to conversation state
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
    return '#0F766E'; // Deep Forest Teal (HALO signature)
  }, [state, colorOverride]);

  // Accent highlights (darker tone of body color for beak)
  const beakColor = useMemo(() => {
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

  // Calculate eye offsets based on lookAt direction
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
    return 'normal';
  }, [state, expression]);

  const handleBlobClick = (e) => {
    if (!interactive) return;
    setIsJiggling(true);
    setTimeout(() => setIsJiggling(false), 500);
    onClick?.(e);
  };

  // Dimensions by size prop
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };
  const sizeClass = sizeMap[size] || sizeMap.md;

  return (
    <div
      onClick={handleBlobClick}
      className={`relative inline-flex items-center justify-center select-none cursor-pointer transition-transform duration-300 ${sizeClass} ${
        isJiggling ? 'scale-110 -rotate-3' : 'hover:scale-105 active:scale-95'
      } ${className}`}
      title="Kuntur - Guardián Digital de HALO"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible drop-shadow-sm transition-all duration-500"
      >
        <defs>
          {/* Subtle ambient lighting on top of head */}
          <linearGradient id="kunturHighlight" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. MAIN SILHOUETTE: Organic Condor Blob Shape */}
        {/* Rounded head, slight crest at top, smooth body base */}
        <path
          d="M 50 14
             C 68 14, 82 28, 82 48
             C 82 68, 72 86, 50 86
             C 28 86, 18 68, 18 48
             C 18 28, 32 14, 50 14 Z"
          fill={bodyColor}
          className="transition-colors duration-500 ease-out"
        />

        {/* Top subtle crest curve of the Andean Condor */}
        <path
          d="M 44 14
             C 44 8, 56 8, 56 14
             Z"
          fill={bodyColor}
          className="transition-colors duration-500 ease-out"
        />

        {/* Subtle highlight sheen */}
        <path
          d="M 50 16
             C 66 16, 78 28, 78 46
             C 78 52, 70 30, 50 30
             C 30 30, 22 52, 22 46
             C 22 28, 34 16, 50 16 Z"
          fill="url(#kunturHighlight)"
        />

        {/* 2. ANDEAN WHITE COLLAR (Iconic condor white feather ruff curve) */}
        <path
          d="M 30 76
             C 42 82, 58 82, 70 76
             C 62 84, 38 84, 30 76 Z"
          fill="#FFFFFF"
          fillOpacity="0.95"
        />

        {/* 3. CONDOR HOOKED BEAK (Key distinguishing feature) */}
        <g
          className="transition-transform duration-200 origin-[50px_54px]"
          style={{
            transform: isSpeaking ? 'translateY(2.5px) scaleY(1.15)' : 'translateY(0)',
          }}
        >
          {/* Main downward hooked beak */}
          <path
            d="M 43 53
               C 43 51, 57 51, 57 53
               C 57 58, 54 65, 50 67
               C 46 65, 43 58, 43 53 Z"
            fill={beakColor}
            className="transition-colors duration-500 ease-out"
          />

          {/* Lower jaw/beak line (shows when speaking) */}
          {isSpeaking && (
            <path
              d="M 46 60
                 C 48 64, 52 64, 54 60
                 Z"
              fill="#FFFFFF"
              opacity="0.9"
            />
          )}
        </g>

        {/* 4. EXPRESSIVE PILL EYES (Pure white capsules) */}
        <g
          className="transition-transform duration-200"
          style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
          }}
        >
          {/* LEFT EYE */}
          {activeExpression === 'happy' ? (
            // Curved happy eye "^"
            <path
              d="M 33 44 Q 38 36 43 44"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            // Pill capsule eye
            <rect
              x="34"
              y="33"
              width="7.5"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '18' : '15'}
              rx="3.75"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[37.75px_40px]"
            />
          )}

          {/* RIGHT EYE */}
          {activeExpression === 'happy' || activeExpression === 'wink' ? (
            // Curved wink / happy eye "^"
            <path
              d="M 57 44 Q 62 36 67 44"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            // Pill capsule eye
            <rect
              x="58.5"
              y="33"
              width="7.5"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '18' : '15'}
              rx="3.75"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[62.25px_40px]"
            />
          )}
        </g>
      </svg>
    </div>
  );
}
