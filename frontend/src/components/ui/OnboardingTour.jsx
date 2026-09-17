import React, { useState, useEffect } from 'react';
import { ChevronRight, X, CheckCircle } from 'lucide-react';
import Button from './Button';

const OnboardingTour = ({ steps, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if user already saw the tour
    const hasSeenTour = localStorage.getItem('us_onboarding_completed');
    if (hasSeenTour) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }
  }, [onComplete]);

  useEffect(() => {
    const updatePosition = () => {
      if (!steps || steps.length === 0) return;
      const el = document.getElementById(steps[currentStep].targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
        }, 300); // Wait for scroll
      } else {
        setTargetRect(null);
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentStep, steps]);

  if (!isVisible || !targetRect) return null;

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  // Calculate tooltip position (prefer bottom, then top)
  const top = targetRect.bottom + window.scrollY + 20;
  const left = targetRect.left + window.scrollX;

  const handleComplete = () => {
    localStorage.setItem('us_onboarding_completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden">
      {/* Target highlight ring with shadow to create the dark overlay */}
      <div 
        className="absolute rounded-xl pointer-events-none transition-all duration-500 ease-in-out ring-4 ring-primary ring-offset-4 ring-offset-[var(--color-primary-bg)] z-[101]"
        style={{
          top: targetRect.top + window.scrollY - 8,
          left: targetRect.left + window.scrollX - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
        }}
      />

      {/* Tooltip */}
      <div 
        className="absolute bg-[var(--color-card-bg)] border border-border shadow-2xl rounded-2xl p-5 w-80 pointer-events-auto transition-all duration-500 ease-in-out z-[102]"
        style={{
          top: top > window.innerHeight - 200 ? targetRect.top + window.scrollY - 200 : top,
          left: Math.max(16, Math.min(left, window.innerWidth - 340)), // Keep within screen bounds
        }}
      >
        <button onClick={handleComplete} className="absolute top-3 right-3 text-text-muted hover:text-text-primary p-1 rounded-full hover:bg-hover transition-colors">
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-3 mb-3">
          <span className="h-7 w-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold ring-2 ring-primary/30 shadow-sm">
            {currentStep + 1}
          </span>
          <h4 className="font-bold text-text-primary text-sm font-display tracking-tight">{step.title}</h4>
        </div>
        
        <p className="text-sm text-text-secondary mb-5 leading-relaxed">{step.content}</p>
        
        <div className="flex justify-between items-center mt-2">
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === currentStep ? 'w-5 bg-primary' : 'w-2 bg-border'}`} />
            ))}
          </div>
          <Button 
            size="sm" 
            className="shadow-md"
            onClick={() => isLast ? handleComplete() : setCurrentStep(c => c + 1)}
            rightIcon={isLast ? <CheckCircle className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          >
            {isLast ? 'Comenzar' : 'Siguiente'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
