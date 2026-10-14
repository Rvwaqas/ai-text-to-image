"use client";

import React, { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { generateImage } from "@/lib/api";
import {
  Sparkles,
  Download,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  RefreshCw,
  Dices,
  Maximize2,
  X,
  Share2,
  Check,
  Wand2,
} from "lucide-react";

const INSPIRATIONS = [
  {
    title: "Cozy Kyoto",
    prompt: "Cozy traditional Japanese coffee shop in Kyoto during gentle rainfall, warm lantern glow, watercolor aesthetic, highly detailed",
  },
  {
    title: "Steampunk Panda",
    prompt: "Cute fluffy red panda wearing brass steampunk goggles studying old maps inside a cozy oak tree library, soft cinematic lighting, 8k",
  },
  {
    title: "Celestial Castle",
    prompt: "Majestic floating castle suspended above pink pastel clouds at golden twilight, cascading waterfalls into the sky, fantasy matte painting",
  },
  {
    title: "Neon Cyber Tea",
    prompt: "Futuristic neon ramen shop in a misty cyberpunk alley, holographic koi fish swimming in the air, hyper-detailed digital art",
  },
  {
    title: "Bioluminescent Reef",
    prompt: "Underwater alien garden with glowing corals and translucent jelly creatures, deep oceanic mystery, octane render",
  },
];

const STYLE_PRESETS = [
  { name: "Cinematic Film", suffix: ", 35mm film photography, cinematic lighting, shallow depth of field, photorealistic, 8k" },
  { name: "Studio Ghibli", suffix: ", Studio Ghibli style, soft vibrant anime aesthetic, painterly background, whimsical" },
  { name: "Digital Painting", suffix: ", masterpiece digital painting, artstation trending, dramatic volumetric lighting, intricate brushwork" },
  { name: "Cyberpunk", suffix: ", vibrant cyberpunk neon lights, rainy reflective street, dark atmosphere, retro-futuristic" },
  { name: "Watercolor", suffix: ", delicate watercolor wash, ink outline, soft pastel palette, textured paper finish" },
];

const MODELS = [
  { id: "auto", name: "⚡ Auto (Fastest GPU Worker)", desc: "Quickest pick from active community rigs" },
  { id: "stable_diffusion", name: "Stable Diffusion 1.5", desc: "Reliable classic, versatile for any idea" },
  { id: "Dreamshaper", name: "Dreamshaper", desc: "Superb for portraits, fantasy & character art" },
  { id: "Deliberate", name: "Deliberate", desc: "Clean anatomical details & photorealism" },
  { id: "ICBINP - I Can't Believe It's Not Photography", name: "ICBINP Photo", desc: "Hyper-realistic portraits & landscapes" },
];

const ASPECT_RATIOS = [
  { label: "1:1 Square", width: 512, height: 512, shape: "w-5 h-5 rounded-sm" },
  { label: "3:4 Portrait", width: 512, height: 768, shape: "w-4 h-6 rounded-sm" },
  { label: "4:3 Landscape", width: 768, height: 512, shape: "w-6 h-4 rounded-sm" },
];

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [model, setModel] = useState(MODELS[0].id);
  const [aspectRatio, setAspectRatio] = useState(ASPECT_RATIOS[0]);
  const [steps, setSteps] = useState(20);
  const [guidance, setGuidance] = useState(7.5);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // GSAP Refs
  const formCardRef = useRef<HTMLDivElement>(null);
  const previewCardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageDisplayRef = useRef<HTMLImageElement>(null);

  // Entrance animations on mount
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([formCardRef.current, previewCardRef.current], {
        y: 35,
        opacity: 0,
        stagger: 0.15,
        duration: 0.9,
        ease: "power3.out",
      });
    });
    return () => ctx.revert();
  }, []);

  // Timer counter during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setElapsed(0);
      interval = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Image reveal GSAP animation
  useEffect(() => {
    if (generatedImage && imageDisplayRef.current) {
      gsap.fromTo(
        imageDisplayRef.current,
        { scale: 0.92, opacity: 0, filter: "blur(12px)" },
        { scale: 1, opacity: 1, filter: "blur(0px)", duration: 0.7, ease: "power2.out" }
      );
    }
  }, [generatedImage]);

  const handleRandomPrompt = () => {
    const randomItem = INSPIRATIONS[Math.floor(Math.random() * INSPIRATIONS.length)];
    setPrompt(randomItem.prompt);
    if (textareaRef.current) {
      gsap.fromTo(
        textareaRef.current,
        { scale: 0.98, borderColor: "#8b5cf6" },
        { scale: 1, borderColor: "rgba(228, 228, 231, 1)", duration: 0.4, ease: "back.out(2)" }
      );
    }
  };

  const handleApplyStyle = (suffix: string) => {
    if (prompt.includes(suffix)) return;
    setPrompt((prev) => `${prev.trim()}${suffix}`);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || prompt.length < 3) {
      setError("Please describe what you want to create (at least 3 characters).");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await generateImage({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || undefined,
        model,
        width: aspectRatio.width,
        height: aspectRatio.height,
        num_inference_steps: steps,
        guidance_scale: guidance,
      });

      if (response.success && response.image) {
        setGeneratedImage(response.image);
      } else {
        setError(response.error || "Generation encountered an issue. Please try again.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error. Backend connection refused.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `dreamcanvas-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Creator Studio Input */}
        <div
          ref={formCardRef}
          className="lg:col-span-6 bg-white/80 border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-2xl transition-all relative overflow-hidden group"
        >
          {/* Subtle gradient accent along top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500" />

          <form onSubmit={handleGenerate} className="space-y-6">
            {/* Header + Surprise Me button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-zinc-900 tracking-tight flex items-center gap-2">
                  <Wand2 className="w-4 h-4 text-violet-600" />
                  Your Vision
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">Describe anything you want to visualize</p>
              </div>

              <button
                type="button"
                onClick={handleRandomPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-200/80 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title="Get a spontaneous artistic idea"
              >
                <Dices className="w-3.5 h-3.5 text-violet-600" />
                <span>Surprise Me</span>
              </button>
            </div>

            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A dreamy glass greenhouse filled with luminescent plants at midnight, soft mist, ambient fairy lights..."
                className="w-full bg-zinc-50/70 border border-zinc-200 hover:border-zinc-300 focus:border-violet-500 focus:bg-white rounded-2xl px-4 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-4 focus:ring-violet-500/10 transition-all resize-none shadow-xs"
                required
              />
              {prompt && (
                <button
                  type="button"
                  onClick={() => setPrompt("")}
                  className="absolute top-3 right-3 p-1 rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200/50 transition-colors"
                  title="Clear prompt"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Inspiration Chips */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Quick Inspirations:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {INSPIRATIONS.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setPrompt(item.prompt)}
                    className="px-2.5 py-1.5 rounded-xl text-xs bg-zinc-100/80 hover:bg-violet-50 text-zinc-700 hover:text-violet-700 border border-zinc-200/70 hover:border-violet-300 font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    ✨ {item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Presets */}
            <div>
              <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Enhance with Aesthetic:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {STYLE_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handleApplyStyle(preset.suffix)}
                    className="px-2.5 py-1.5 rounded-xl text-xs bg-indigo-50/70 hover:bg-indigo-100/90 text-indigo-700 border border-indigo-200/70 hover:border-indigo-400 font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
                  >
                    + {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Model & Aspect Ratio Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Model */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  AI Generator Model
                </label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-zinc-800 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white transition-all cursor-pointer shadow-xs"
                >
                  {MODELS.map((m) => (
                    <option key={m.id} value={m.id} className="bg-white text-zinc-900">
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dimensions / Aspect Ratio */}
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Canvas Aspect
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {ASPECT_RATIOS.map((ratio) => (
                    <button
                      key={ratio.label}
                      type="button"
                      onClick={() => setAspectRatio(ratio)}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[11px] font-semibold transition-all cursor-pointer ${
                        aspectRatio.label === ratio.label
                          ? "bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20"
                          : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                      }`}
                    >
                      <span className={`border border-current mb-1 opacity-70 ${ratio.shape}`} />
                      <span>{ratio.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced Toggle Drawer */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-400" />
                <span>{showAdvanced ? "Hide Fine-tuning" : "Fine-tune (Steps & Guidance)"}</span>
              </button>

              {showAdvanced && (
                <div className="mt-3.5 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 space-y-4 shadow-xs">
                  {/* Negative prompt */}
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">
                      Exclude Elements (Negative Prompt)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="blurry, watermark, cropped, distorted anatomy"
                      className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                  </div>

                  {/* Sliders */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-zinc-600 mb-1">
                        <span>Quality Steps</span>
                        <span className="font-mono text-violet-700 font-bold">{steps}</span>
                      </div>
                      <input
                        type="range"
                        min={12}
                        max={40}
                        value={steps}
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="w-full accent-violet-600 cursor-pointer"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-zinc-600 mb-1">
                        <span>Prompt Adherence</span>
                        <span className="font-mono text-violet-700 font-bold">{guidance}</span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={16}
                        step={0.5}
                        value={guidance}
                        onChange={(e) => setGuidance(Number(e.target.value))}
                        className="w-full accent-violet-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Notification */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-800 shadow-xs">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold text-rose-900">Notice</p>
                  <p className="mt-0.5 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-pink-500 hover:from-violet-500 hover:via-indigo-500 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm text-white shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2.5 transition-all hover:shadow-violet-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Weaving artwork ({elapsed}s)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Bring Imagination to Life</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Display Canvas */}
        <div
          ref={previewCardRef}
          className="lg:col-span-6 bg-white/80 border border-zinc-200/90 rounded-3xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.04)] backdrop-blur-2xl min-h-[540px] flex flex-col justify-center items-center relative overflow-hidden group"
        >
          {isLoading ? (
            /* Loading State */
            <div className="text-center py-20 px-6 space-y-6">
              <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-violet-400 to-pink-400 blur-xl opacity-30 animate-pulse" />
                <div className="w-20 h-20 rounded-full border-3 border-violet-200 border-t-violet-600 animate-spin flex items-center justify-center shadow-xs" />
                <Sparkles className="w-7 h-7 text-violet-600 absolute" />
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-xs font-mono font-medium shadow-xs">
                  <span>AI Horde Queue</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 animate-ping" />
                  <span>{elapsed}s</span>
                </div>
                <h4 className="text-lg font-bold text-zinc-900">Synthesizing Pixels</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Community GPU workers are rendering your prompt. This free distributed process typically takes 10–25 seconds.
                </p>
              </div>
            </div>
          ) : generatedImage ? (
            /* Image Result */
            <div className="w-full flex flex-col items-center space-y-5">
              <div className="relative w-full rounded-2xl overflow-hidden border border-zinc-200/80 shadow-xl bg-zinc-50 group/image flex items-center justify-center max-h-[520px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imageDisplayRef}
                  src={generatedImage}
                  alt={prompt || "AI generated piece"}
                  className="max-h-[500px] w-auto object-contain rounded-xl transition-transform duration-500 group-hover/image:scale-[1.02]"
                />

                {/* Quick overlay actions */}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button
                    type="button"
                    onClick={() => setIsLightboxOpen(true)}
                    className="p-3 rounded-full bg-white/80 hover:bg-white text-zinc-800 backdrop-blur-md shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="Fullscreen zoom"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="p-3 rounded-full bg-violet-600 hover:bg-violet-700 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                    title="Download high-res PNG"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="w-full flex items-center justify-between gap-3 pt-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-800 font-semibold truncate">
                    &ldquo;{prompt}&rdquo;
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium">
                    {aspectRatio.width} × {aspectRatio.height}px • AI Horde
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs border border-zinc-200/80 transition-all cursor-pointer shadow-xs"
                    title="Copy prompt text"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleGenerate()}
                    className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 text-zinc-700 text-xs border border-zinc-200/80 transition-all hover:rotate-180 duration-500 cursor-pointer shadow-xs"
                    title="Generate variation"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty Canvas State */
            <div className="text-center py-20 px-4 space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-violet-100 via-pink-50 to-indigo-100 border border-violet-200/60 flex items-center justify-center mx-auto text-violet-600 shadow-md">
                <Sparkles className="w-8 h-8 text-violet-600 animate-pulse" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h4 className="text-base font-bold text-zinc-800">Your Canvas Awaits</h4>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Type an imaginative scene, pick an inspiration chip, or click &apos;Surprise Me&apos; to watch distributed AI create your artwork.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && generatedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImage}
              alt="Zoomed Generation"
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl border border-white/20"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload();
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-xl transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Save to Computer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
