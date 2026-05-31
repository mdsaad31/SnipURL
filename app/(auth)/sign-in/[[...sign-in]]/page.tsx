import { SignIn } from "@clerk/nextjs";
import { Scissors } from "lucide-react";
import { AuthPanel } from "../../_components/auth-panel";

const clerkAppearance = {
  elements: {
    rootBox: "w-full",
    card: "bg-transparent shadow-none border-none p-0 w-full",
    headerTitle: "font-sans font-medium text-[24px] text-text-primary",
    headerSubtitle: "font-sans text-[14px] text-text-secondary mt-1",
    socialButtonsBlockButton:
      "h-[44px] bg-white border-[1.5px] border-border rounded-btn text-text-primary font-medium hover:bg-[#FDF3E7] hover:border-primary transition-all shadow-none",
    socialButtonsBlockButtonText: "font-sans text-sm",
    dividerLine: "bg-border",
    dividerText: "text-text-tertiary text-xs font-medium uppercase tracking-wider",
    formFieldLabel: "text-text-primary font-medium text-[13px] mb-1.5",
    formFieldInput:
      "h-[44px] bg-white border-[1.5px] border-border rounded-btn focus:border-primary focus:ring-2 focus:ring-primary/15 text-base text-text-primary transition-all",
    formButtonPrimary:
      "h-[44px] bg-primary hover:bg-primary-hover text-white font-medium rounded-btn text-base shadow-none transition-all",
    footerActionText: "text-text-secondary",
    footerActionLink: "text-primary hover:text-primary-hover font-medium",
    formFieldAction: "text-primary hover:text-primary-hover font-medium text-[13px]",
    identityPreviewEditButtonIcon: "text-primary",
  },
};

export default function SignInPage() {
  return (
    <>
      {/* Left Decorative Panel */}
      <AuthPanel />

      {/* Right Form Panel */}
      <div className="w-full md:w-[55%] flex items-center justify-center p-6 bg-background relative">
        <div className="absolute top-6 left-6 md:hidden">
          <div className="flex items-center gap-2">
            <Scissors className="w-6 h-6 text-primary" strokeWidth={2.5} />
            <span className="font-sans font-semibold text-text-primary text-2xl tracking-tight">
              Snip
            </span>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          <SignIn appearance={clerkAppearance} />
        </div>
      </div>
    </>
  );
}
