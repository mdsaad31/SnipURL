"use client";

import { Sidebar } from "./_components/sidebar";
import { CreateLinkModal } from "./_components/create-link-modal";
import { useLinks } from "./_hooks/use-links";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { mutate } = useLinks();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - desktop: left sidebar, mobile: bottom tab bar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-[1000px] mx-auto w-full">{children}</div>
        </main>
      </div>

      {/* Modals are rendered here so they overlay the entire viewport */}
      <CreateLinkModal onSuccess={mutate} />
    </div>
  );
}
