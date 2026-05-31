import { Scissors, CheckCircle2 } from "lucide-react";

export function AuthPanel() {
  return (
    <div className="hidden md:flex w-[45%] bg-[#1A1410] p-12 flex-col justify-between relative overflow-hidden">
      {/* Large Decorative Icon */}
      <div className="absolute -bottom-10 -left-10 text-[#2D2520] opacity-50 z-0">
        <Scissors className="w-[300px] h-[300px]" strokeWidth={1} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-24">
          <Scissors className="w-6 h-6 text-primary" strokeWidth={2.5} />
          <span className="font-sans font-semibold text-white text-2xl tracking-tight">
            Snip
          </span>
        </div>

        <blockquote className="font-serif italic text-[32px] text-background leading-tight max-w-[400px]">
          &ldquo;Short links. Long impressions.&rdquo;
        </blockquote>
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[#A8998C] font-medium text-sm">
            No credit card required
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[#A8998C] font-medium text-sm">
            Unlimited free links
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <span className="text-[#A8998C] font-medium text-sm">
            Real-time analytics
          </span>
        </div>
      </div>
    </div>
  );
}
