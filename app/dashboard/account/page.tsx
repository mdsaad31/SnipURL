"use client";

import { UserProfile } from "@clerk/nextjs";

export default function AccountPage() {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-sans font-medium text-[22px] text-text-primary">
          My Account
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your profile, security, and connected accounts
        </p>
      </div>

      {/* Clerk UserProfile embedded */}
      <div className="w-full">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-surface border border-border rounded-card shadow-sm w-full",
              navbar: "border-r border-border bg-[#FDFAF5]",
              navbarButton:
                "text-text-secondary hover:text-text-primary hover:bg-[#F5EFE6] rounded-btn font-medium text-sm",
              navbarButtonActive:
                "text-primary bg-[#FDF3E7] font-medium",
              pageScrollBox: "p-6",
              formFieldLabel: "text-text-primary font-medium text-sm",
              formFieldInput:
                "border-border bg-white text-text-primary focus:border-primary focus:ring-primary/15 rounded-btn",
              formButtonPrimary:
                "bg-primary hover:bg-primary-hover text-white font-medium rounded-btn",
              badge: "bg-[#FDF3E7] text-primary",
              avatarImageActionsUpload:
                "text-primary hover:text-primary-hover",
              profileSectionTitle: "text-text-primary font-medium",
              profileSectionTitleText: "text-text-primary font-medium",
              accordionTriggerButton:
                "text-text-primary hover:bg-[#F5EFE6]",
              headerTitle: "text-text-primary font-sans font-medium",
              headerSubtitle: "text-text-secondary",
            },
          }}
        />
      </div>
    </div>
  );
}
