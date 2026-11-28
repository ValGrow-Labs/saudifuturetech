'use client';

import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export const SmoothScrollProvider: React.FC<SmoothScrollProviderProps> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Respect user's motion preference: bypass Lenis if reduced motion is requested
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      return;
    }

    // Initialize Lenis smooth scrolling with inertia physics mirroring Saudi Makes Future
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      infinite: false,
    });

    lenisRef.current = lenis;

    // Attach to window for global developer accessibility
    if (typeof window !== 'undefined') {
      (window as unknown as { lenis: Lenis }).lenis = lenis;
    }

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Smooth momentum handling for in-page anchor links (e.g., #pillars-coverflow)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;
      const href = target.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          lenis.scrollTo(el as HTMLElement, { offset: -40, duration: 1.3 });
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        document.removeEventListener('click', handleAnchorClick);
        cancelAnimationFrame(rafId);
        lenis.destroy();
        lenisRef.current = null;
        if (typeof window !== 'undefined') {
          (window as unknown as { lenis: unknown }).lenis = null;
        }
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      document.removeEventListener('click', handleAnchorClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      if (typeof window !== 'undefined') {
        (window as unknown as { lenis: unknown }).lenis = null;
      }
    };
  }, []);

  return <>{children}</>;
};

