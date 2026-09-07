import React, { useState, useEffect } from 'react';
import { Map, Users, Zap, BarChart, Shield } from 'lucide-react';

import img1 from '../../images/1.png';
import img2 from '../../images/2.png';
import img3 from '../../images/3.png';
import img4 from '../../images/4.png';

export const InteractiveSelector = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animatedOptions, setAnimatedOptions] = useState([]);
  
  const options = [
    {
      title: "Radar Ciudadano",
      description: "Monitoreo en tiempo real de incidentes",
      image: img1,
      icon: <Map size={20} className="text-white" />
    },
    {
      title: "Validación Vecinal",
      description: "Filtro anti-spam comunitario",
      image: img2,
      icon: <Users size={20} className="text-white" />
    },
    {
      title: "Centro de Mando",
      description: "Análisis y estadísticas en vivo",
      image: img3,
      icon: <BarChart size={20} className="text-white" />
    },
    {
      title: "Portal Autoridades",
      description: "Gestión segura de incidentes",
      image: img4,
      icon: <Shield size={20} className="text-white" />
    }
  ];

  const handleOptionClick = (index) => {
    setActiveIndex(index);
  };

  // Entrance animation
  useEffect(() => {
    const timers = [];
    options.forEach((_, i) => {
      const timer = setTimeout(() => {
        setAnimatedOptions(prev => [...prev, i]);
      }, 150 * i);
      timers.push(timer);
    });
    return () => timers.forEach(timer => clearTimeout(timer));
  }, []);

  // Auto-slide effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % options.length);
    }, 4000); // Auto-slide every 4 seconds
    return () => clearInterval(slideInterval);
  }, [options.length]);

  return (
    <div className="relative flex flex-col items-center justify-center w-full font-sans text-white"> 
      {/* Options Container */}
      <div className="options flex w-full max-w-6xl lg:max-w-7xl min-w-[300px] h-[500px] md:h-[550px] lg:h-[600px] mx-auto items-stretch overflow-hidden relative rounded-3xl shadow-2xl">
        {options.map((option, index) => (
          <div
            key={index}
            className={`
              option relative flex flex-col justify-end overflow-hidden transition-all duration-700 ease-in-out
              ${activeIndex === index ? 'active' : ''}
            `}
            style={{
              backgroundImage: `url('${option.image}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backfaceVisibility: 'hidden',
              opacity: animatedOptions.includes(index) ? 1 : 0,
              transform: animatedOptions.includes(index) ? 'translateX(0)' : 'translateX(-60px)',
              minWidth: '60px',
              minHeight: '100px',
              margin: 0,
              borderRadius: 0,
              borderWidth: activeIndex === index ? '2px' : '0px',
              borderStyle: 'solid',
              borderColor: activeIndex === index ? 'var(--color-primary, #4C9F70)' : 'transparent',
              cursor: 'pointer',
              backgroundColor: '#18181b',
              flex: activeIndex === index ? '7 1 0%' : '1 1 0%',
              zIndex: activeIndex === index ? 10 : 1,
            }}
            onClick={() => handleOptionClick(index)}
          >
            {/* Shadow overlay effect to make text readable */}
            <div 
              className="shadow absolute left-0 right-0 bottom-0 pointer-events-none transition-all duration-700 ease-in-out"
              style={{
                height: activeIndex === index ? '250px' : '0px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0) 100%)',
                opacity: activeIndex === index ? 1 : 0
              }}
            />
            
            {/* Label with icon and info */}
            <div className="label absolute left-0 right-0 bottom-6 flex items-center justify-start z-10 pointer-events-none px-4 md:px-6 gap-4 w-full">
              <div className="icon min-w-[40px] max-w-[40px] h-[40px] md:min-w-[48px] md:max-w-[48px] md:h-[48px] flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex-shrink-0 transition-all duration-500">
                {option.icon}
              </div>
              <div className="info text-white whitespace-pre relative overflow-hidden">
                <div 
                  className="main font-bold text-lg md:text-2xl transition-all duration-700 ease-in-out mb-1"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(20px)'
                  }}
                >
                  {option.title}
                </div>
                <div 
                  className="sub text-sm md:text-base text-gray-200 transition-all duration-700 ease-in-out font-medium"
                  style={{
                    opacity: activeIndex === index ? 1 : 0,
                    transform: activeIndex === index ? 'translateX(0)' : 'translateX(20px)'
                  }}
                >
                  {option.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
