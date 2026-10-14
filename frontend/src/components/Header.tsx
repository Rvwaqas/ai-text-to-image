"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Palette, Sparkles, Cpu, Heart } from "lucide-react";

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.fromTo(
        headerRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <header
      ref={headerRef}
      className="w-full border-b border-zinc-200/80 bg-white/75 backdrop-blur-xl sticky top-0 z-40 transition-all shadow-xs"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3.5 group cursor-pointer">
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 p-0.5 shadow-md shadow-violet-500/20 transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Palette className="w-5 h-5 text-violet-600 group-hover:text-pink-600 transition-colors" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-zinc-900 tracking-tight">
                DreamCanvas
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200/80 font-medium">
                AI Horde
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-0.5">
              <span>Made for creators</span>
              <span className="text-zinc-300">•</span>
              <span className="flex items-center gap-1 text-pink-600">
                <Heart className="w-3 h-3 fill-pink-500/20" /> Free GPU Cluster
              </span>
            </p>
          </div>
        </div>

        {/* Right Info Pill */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-700 shadow-xs">
            <Cpu className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-zinc-500">Engine:</span>
            <span className="font-semibold text-zinc-800">FastAPI & Horde</span>
          </div>
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Free Forever</span>
          </div>
        </div>
      </div>
    </header>
  );
}
