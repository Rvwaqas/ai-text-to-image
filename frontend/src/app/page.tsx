"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import Header from "@/components/Header";
import ImageGenerator from "@/components/ImageGenerator";
import ThreeCanvas from "@/components/ThreeCanvas";
import { Sparkles, Heart, ArrowRight, RotateCcw } from "lucide-react";

export default function Home() {
  const [stage, setStage] = useState<"intro" | "studio">("intro");

  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const heroContentRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<HTMLDivElement>(null);

  // Cinematic sequence on initial load
  useEffect(() => {
    if (stage === "intro") {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline();

        // 1. Back to Front Zoom of Hero Text
        tl.fromTo(
          heroContentRef.current,
          {
            scale: 0.3,
            opacity: 0,
            y: 40,
            filter: "blur(20px)",
          },
          {
            scale: 1,
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 1.6,
            ease: "power3.out",
          }
        )
          // 2. Pause briefly in the spotlight
          .to({}, { duration: 1.8 })
          // 3. Zoom forward into screen & vanish smoothly
          .to(heroContentRef.current, {
            scale: 1.35,
            opacity: 0,
            filter: "blur(14px)",
            duration: 0.8,
            ease: "power2.inOut",
            onComplete: () => {
              setStage("studio");
            },
          });
      });

      return () => ctx.revert();
    }
  }, [stage]);

  // When stage shifts to "studio", smoothly animate generator form into view
  useEffect(() => {
    if (stage === "studio" && studioRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          studioRef.current,
          {
            y: 80,
            opacity: 0,
            scale: 0.95,
            filter: "blur(10px)",
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
            duration: 1.0,
            ease: "power3.out",
          }
        );
      });
      return () => ctx.revert();
    }
  }, [stage]);

  // Fast forward into studio immediately if clicked
  const handleSkipToStudio = () => {
    if (stage === "intro" && heroContentRef.current) {
      gsap.to(heroContentRef.current, {
        scale: 1.3,
        opacity: 0,
        filter: "blur(14px)",
        duration: 0.5,
        ease: "power2.inOut",
        onComplete: () => setStage("studio"),
      });
    }
  };

  const handleReplayIntro = () => {
    setStage("intro");
  };

  return (
    <div className="relative min-h-screen bg-[#fcfbfa] text-zinc-900 flex flex-col selection:bg-violet-200 selection:text-violet-900 overflow-x-hidden font-sans">
      {/* Interactive Three.js 3D Particles Background */}
      <ThreeCanvas />

      {/* Ambient Gradient Glows (Light & Airy) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-violet-200/40 rounded-full blur-[160px]" />
        <div className="absolute top-1/3 -right-32 w-[650px] h-[650px] bg-pink-200/35 rounded-full blur-[160px]" />
        <div className="absolute -bottom-32 left-1/4 w-[550px] h-[550px] bg-sky-200/40 rounded-full blur-[150px]" />
      </div>

      <Header />

      <main className="flex-1 relative z-10 flex flex-col justify-center">
        {/* PHASE 1: Cinematic Zoom Hero (Back to Front -> Then Vanishes) */}
        {stage === "intro" && (
          <div
            ref={heroWrapperRef}
            className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#fcfbfa]/60 backdrop-blur-md"
            onClick={handleSkipToStudio}
          >
            <div
              ref={heroContentRef}
              className="max-w-4xl mx-auto text-center space-y-6 px-4 py-8 cursor-pointer select-none"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-zinc-200 text-xs font-semibold text-zinc-700 shadow-md">
                <Sparkles className="w-4 h-4 text-pink-500 animate-spin" />
                <span>Turn your thoughts into living digital art</span>
              </div>

              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-zinc-900 leading-[1.1]">
                Where Human Curiosity Meets{" "}
                <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent block mt-2">
                  Creative AI
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-500 max-w-xl mx-auto leading-relaxed font-normal">
                No subscriptions. No credit cards. Powered by community GPUs on AI Horde and designed for everyday creators.
              </p>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleSkipToStudio}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold shadow-xl shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>Enter Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-zinc-400 font-medium">Click anywhere or wait to enter studio...</p>
            </div>
          </div>
        )}

        {/* PHASE 2: Main Image Generator Studio (Arrives smoothly after intro) */}
        {stage === "studio" && (
          <div ref={studioRef} className="w-full pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                  Creative Studio
                </h2>
                <p className="text-xs text-zinc-500">Transform your prompts into high-resolution imagery</p>
              </div>

              <button
                type="button"
                onClick={handleReplayIntro}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-zinc-600 text-xs font-semibold border border-zinc-200 shadow-xs transition-all hover:scale-105 cursor-pointer"
                title="Replay cinematic intro"
              >
                <RotateCcw className="w-3.5 h-3.5 text-violet-600" />
                <span>Replay Intro</span>
              </button>
            </div>

            <ImageGenerator />
          </div>
        )}
      </main>

      {/* Human Friendly Light Footer */}
      <footer className="w-full border-t border-zinc-200/80 py-6 text-center text-xs text-zinc-500 relative z-10 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1.5 justify-center font-medium">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 inline" />
            <span>using Next.js 15, Three.js, GSAP & AI Horde</span>
          </p>
          <div className="flex items-center gap-4 text-zinc-400 font-medium">
            <span>Free & Open GPU Cluster</span>
            <span>•</span>
            <span>Interactive 3D Canvas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
