import { SignUp } from "@clerk/nextjs";
import { AuthPanel } from "../../_components/auth-panel";

export default function SignUpPage() {
  return (
    <>
      {/* Left Decorative Panel */}
      <AuthPanel />

      {/* Right Form Panel */}
      <div className="w-full md:w-[55%] flex items-center justify-center px-6 py-16 sm:px-10 md:px-14 lg:px-20 bg-background relative min-h-screen">
        <div className="w-full max-w-[400px]">
          <SignUp
            appearance={{
              variables: {
                colorPrimary: "#C17A2E",
                fontFamily: "'DM Sans', sans-serif",
              },
            }}
          />
        </div>
      </div>
    </>
  );
}
