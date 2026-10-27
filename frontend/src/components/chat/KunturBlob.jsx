import React, { useState, useEffect, useMemo } from 'react';

/**
 * KunturBlob - Authentic Andean Condor in 3/4 Perspective (Minimalist Vector Style).
 *
 * Key Condor Anatomy:
 * 1. Prominent hooked raptor beak in 3/4 profile with arched ridge and hooked claw tip.
 * 2. Warm amber/honey horn coloring (#F59E0B) with dark cere (#334155) - NO MORE WHITE TOOTH!
 * 3. Condor crest (carúncula) smoothly curving across the crown.
 * 4. Fluffy Andean white feather ruff (gorguera) around the neck.
 * 5. Animated wings in perspective that spread open when clicked/opening chat.
 * 6. Expressive pill eyes with natural blinking, gaze tracking, winking, and smiling.
 * 7. Dynamic single-color body morphing (Teal, Blue, Red, Green, Slate).
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

  // Natural random blinking
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

  // Darker tone for far wing, shadow, and crest
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

  // Eye movement coordinates
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
        <defs>
          <filter id="kunturShadow3D" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodOpacity="0.22" />
          </filter>
        </defs>

        {/* 1. FAR LEFT WING (Behind body in 3/4 view) */}
        <g
          className="transition-transform duration-500 ease-out origin-[32px_54px]"
          style={{
            transform: effectiveWingsOpen ? 'rotate(-42deg) translate(-4px, -6px) scale(0.95)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M 32 50
               C 20 54, 12 68, 16 80
               C 18 81, 21 77, 23 79
               C 25 76, 28 74, 30 78
               C 33 71, 34 62, 32 50 Z"
            fill={wingColor}
            className="transition-colors duration-500 opacity-90"
          />
        </g>

        {/* 2. CONDOR CREST (Carúncula andina en la corona hacia la nuca) */}
        <path
          d="M 36 21
             C 34 11, 48 9, 54 14
             C 58 18, 56 23, 50 24 Z"
          fill={wingColor}
          className="transition-colors duration-500"
        />

        {/* 3. MAIN BODY IN 3/4 PERSPECTIVE */}
        <path
          d="M 46 20
             C 66 20, 82 32, 82 58
             C 82 80, 68 96, 48 96
             C 28 96, 18 80, 18 58
             C 18 32, 28 20, 46 20 Z"
          fill={bodyColor}
          className="transition-colors duration-500"
        />

        {/* 4. ANDEAN WHITE RUFF / GORGUERA (Collar blanco esponjoso envolvente) */}
        <path
          d="M 24 78
             Q 34 88 44 82
             Q 54 90 64 82
             Q 74 88 82 78
             Q 64 98 24 78 Z"
          fill="#FFFFFF"
          className="drop-shadow-xs"
        />

        {/* 5. NEAR RIGHT WING (Folds along the flank in 3/4, flaps wide on open) */}
        <g
          className="transition-transform duration-500 ease-out origin-[64px_62px]"
          style={{
            transform: effectiveWingsOpen ? 'rotate(45deg) translate(6px, -4px)' : 'rotate(0deg)',
          }}
        >
          <path
            d="M 64 60
               C 76 64, 86 76, 82 90
               C 80 91, 77 86, 75 89
               C 73 85, 70 83, 68 87
               C 65 80, 63 71, 64 60 Z"
            fill={wingColor}
            className="transition-colors duration-500"
          />
        </g>

        {/* 6. EXPRESSIVE PILL EYES IN 3/4 PERSPECTIVE */}
        <g
          className="transition-transform duration-200"
          style={{
            transform: `translate(${eyeOffset.x}px, ${eyeOffset.y}px)`,
          }}
        >
          {/* FAR LEFT EYE (Smaller, in perspective) */}
          {activeExpression === 'happy' ? (
            <path
              d="M 33 42 Q 38 35 43 42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="34"
              y="32"
              width="7"
              height={isBlinking ? '1.5' : activeExpression === 'alert' ? '17' : '13'}
              rx="3.5"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[37.5px_38px]"
            />
          )}

          {/* NEAR RIGHT EYE (Prominent in 3/4) */}
          {activeExpression === 'happy' || activeExpression === 'wink' ? (
            <path
              d="M 54 42 Q 60 34 66 42"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ) : (
            <rect
              x="54"
              y="30"
              width="8.5"
              height={isBlinking ? '2' : activeExpression === 'alert' ? '20' : '15'}
              rx="4.25"
              fill="#FFFFFF"
              className="transition-all duration-150 origin-[58.25px_38px]"
            />
          )}
        </g>

        {/* 7. AUTHENTIC 3/4 HOOKED CONDOR BEAK (NO TOOTH, REAL RAPTOR HOOK) */}
        <g
          className="transition-transform duration-150 origin-[60px_52px]"
          style={{
            transform: isSpeaking ? 'translateY(2.5px) rotate(3deg)' : 'translateY(0)',
          }}
        >
          {/* Lower Mandible (Articulates down when speaking) */}
          <path
            d="M 60 56
               C 66 56, 75 58, 77 64
               C 72 65, 62 62, 58 59 Z"
            fill="#B45309"
          />

          {/* Dark Cere Base (Cera nasal del cóndor) */}
          <path
            d="M 50 48
               C 56 46, 68 47, 72 52
               C 68 56, 56 55, 48 51 Z"
            fill="#334155"
          />

          {/* Main Arched Raptor Hook (Curving boldly forward and down!) */}
          <path
            d="M 52 49
               C 62 47, 82 49, 87 58
               C 89 62, 87 72, 80 75
               C 76 77, 74 72, 76 67
               C 78 62, 74 56, 56 56 Z"
            fill="#F59E0B"
            className="filter drop-shadow-xs"
          />

          {/* Sharp Beak Tip Highlight (Ivory / Golden sheen) */}
          <path
            d="M 72 54
               C 78 52, 84 54, 86 59
               C 88 64, 85 71, 80 74
               C 77 75, 76 72, 77 68
               C 79 63, 76 58, 72 54 Z"
            fill="#FDE047"
            opacity="0.95"
          />
        </g>
      </svg>
    </div>
  );
}
