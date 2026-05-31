export function HeroSection() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-8 px-4 py-1.5 rounded-full border border-[#F0DCB8] bg-[#FDF3E7] text-primary-hover text-xs font-medium">
        Free forever · No credit card
      </div>

      <h1 className="font-serif text-[48px] md:text-[56px] leading-[1.15] text-text-primary mb-6 tracking-tight">
        Make every link count.
      </h1>

      <p className="text-lg text-text-secondary mb-12 max-w-[500px] leading-relaxed">
        Shorten, brand, and track your links in one beautiful place. No account
        needed to start.
      </p>
    </div>
  );
}
