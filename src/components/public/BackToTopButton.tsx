'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTopButton: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past 450px
      setVisible(window.scrollY > 450);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Scroll to top of publication"
      className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-editorial-pure/95 backdrop-blur-md text-ink-high border border-editorial-hairline shadow-md hover:bg-brand-yellow hover:border-brand-yellow hover:text-ink-high transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <ArrowUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};

