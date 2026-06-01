import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Snip",
  description:
    "Read the Terms of Service for Snip, the URL shortener. Learn about acceptable use, account responsibilities, and our service commitments.",
};

export default function TermsOfServicePage() {
  const effectiveDate = "June 1, 2025";
  const lastUpdated = "June 1, 2025";

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="w-full border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-[800px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Snip"
              width={36}
              height={36}
              className="group-hover:scale-105 transition-transform"
            />
            <span className="font-sans font-semibold text-text-primary text-xl tracking-tight">
              Snip
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-text-secondary hover:text-primary font-medium transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Content */}
      <article className="max-w-[800px] mx-auto px-6 py-16 md:py-20">
        {/* Title Block */}
        <div className="mb-16 text-center">
          <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-[0.15em] mb-4">
            Legal
          </p>
          <h1 className="font-serif text-[36px] md:text-[44px] text-text-primary leading-tight mb-4">
            Terms of Service
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-text-tertiary">
            <span>Effective: {effectiveDate}</span>
            <span className="w-1 h-1 bg-text-tertiary rounded-full" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Body */}
        <div className="prose-editorial">
          <Section number="1" title="Acceptance of Terms">
            <p>
              By accessing or using the Snip URL shortening service (&ldquo;Service&rdquo;), 
              available at snipurl.click and any associated domains, you agree to be 
              bound by these Terms of Service (&ldquo;Terms&rdquo;). If you do not agree to these 
              Terms, you may not access or use the Service.
            </p>
            <p>
              We reserve the right to modify these Terms at any time. Material changes 
              will be communicated via the email associated with your account or through 
              a prominent notice on the Service. Your continued use of the Service after 
              such changes constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section number="2" title="Description of the Service">
            <p>
              Snip provides a URL shortening platform that allows users to:
            </p>
            <ul>
              <li>Shorten long URLs into compact, shareable links</li>
              <li>Create custom-branded aliases for shortened links (authenticated users only)</li>
              <li>Generate QR codes for shortened URLs</li>
              <li>Access click analytics, including geographic, device, and referrer data</li>
              <li>Optionally protect links with a password or expiration date</li>
            </ul>
            <p>
              Both authenticated and anonymous users may shorten URLs. Certain features, 
              including custom aliases and analytics dashboards, require account creation.
            </p>
          </Section>

          <Section number="3" title="Account Registration & Security">
            <p>
              To access premium features, you must create an account using a third-party 
              authentication provider (currently Clerk). You agree to:
            </p>
            <ul>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security and confidentiality of your authentication credentials</li>
              <li>Notify us immediately of any unauthorized access to your account</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate accounts that violate these 
              Terms or that we reasonably believe have been compromised.
            </p>
          </Section>

          <Section number="4" title="Acceptable Use Policy">
            <p>
              You agree not to use the Service to shorten, distribute, or redirect to 
              URLs that:
            </p>
            <ul>
              <li>Contain malware, viruses, phishing attempts, or other malicious software</li>
              <li>Promote illegal activities, including but not limited to fraud, identity theft, or trafficking</li>
              <li>Distribute unsolicited bulk communications (spam)</li>
              <li>Infringe on intellectual property rights, including copyrights and trademarks</li>
              <li>Contain or promote child sexual abuse material (CSAM)</li>
              <li>Harass, threaten, defame, or discriminate against individuals or groups</li>
              <li>Violate the privacy rights of any third party</li>
              <li>Deceive or mislead end users about the destination or nature of the link</li>
            </ul>
            <p>
              We reserve the right to disable, deactivate, or remove any link that 
              violates this policy without prior notice. Repeated violations may result 
              in permanent account suspension.
            </p>
          </Section>

          <Section number="5" title="Link Permanence & Availability">
            <p>
              While we strive to maintain the availability of all shortened links, we 
              do not guarantee permanent availability. Links may become unavailable if:
            </p>
            <ul>
              <li>They violate our Acceptable Use Policy</li>
              <li>The associated account is deleted or suspended</li>
              <li>The link expires (if an expiration date was set by the creator)</li>
              <li>The Service is discontinued or undergoes significant changes</li>
            </ul>
            <p>
              Links created by anonymous users (without an account) are not 
              guaranteed any minimum retention period.
            </p>
          </Section>

          <Section number="6" title="Intellectual Property">
            <p>
              The Snip service, including its name, logo, design, code, and 
              documentation, is the intellectual property of its creators and is 
              protected by applicable copyright and trademark laws.
            </p>
            <p>
              You retain ownership of the URLs you shorten and any custom aliases you 
              create. By using the Service, you grant us a limited, non-exclusive 
              license to store, process, and redirect your URLs as necessary to 
              operate the Service.
            </p>
          </Section>

          <Section number="7" title="Privacy & Data Collection">
            <p>
              Your use of the Service is also governed by our{" "}
              <Link
                href="/privacystatement"
                className="text-primary hover:text-primary-hover font-medium underline underline-offset-2"
              >
                Privacy Statement
              </Link>
              , which describes how we collect, use, and protect your data. Key 
              points include:
            </p>
            <ul>
              <li>We collect click analytics data (country, device, referrer) in aggregate</li>
              <li>IP addresses are hashed before storage and cannot be reversed</li>
              <li>Authentication is handled by Clerk; we do not store passwords</li>
              <li>We do not sell your personal data to third parties</li>
            </ul>
          </Section>

          <Section number="8" title="Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, Snip and its 
              creators shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, including but not limited to:
            </p>
            <ul>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Damages arising from link unavailability or redirect failures</li>
              <li>Damages resulting from unauthorized access to your account</li>
              <li>Any actions taken by third parties who access content through shortened links</li>
            </ul>
            <p>
              The Service is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; 
              without warranties of any kind, express or implied, including 
              merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </Section>

          <Section number="9" title="Indemnification">
            <p>
              You agree to indemnify and hold harmless Snip, its creators, and 
              affiliates from any claims, damages, losses, liabilities, and expenses 
              (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use of the Service</li>
              <li>Your violation of these Terms</li>
              <li>Content you share or redirect to through the Service</li>
              <li>Your violation of any rights of a third party</li>
            </ul>
          </Section>

          <Section number="10" title="Termination">
            <p>
              We may suspend or terminate your access to the Service at any time, 
              with or without cause, with or without notice. Upon termination:
            </p>
            <ul>
              <li>Your right to access the Service and dashboard will cease immediately</li>
              <li>Links created under your account may be deactivated</li>
              <li>We are not obligated to retain or provide copies of your data</li>
            </ul>
            <p>
              You may delete your account at any time through Clerk&apos;s account 
              management interface. Account deletion will remove your profile data 
              from our systems.
            </p>
          </Section>

          <Section number="11" title="Governing Law & Disputes">
            <p>
              These Terms shall be governed by and construed in accordance with 
              applicable laws, without regard to conflict of law provisions. Any 
              disputes arising from these Terms or your use of the Service shall 
              be resolved through good-faith negotiation. If negotiation fails, 
              disputes shall be submitted to binding arbitration.
            </p>
          </Section>

          <Section number="12" title="Contact">
            <p>
              If you have questions or concerns about these Terms, please contact 
              us at:
            </p>
            <div className="bg-[#F5EFE6] border border-border rounded-[12px] p-5 mt-3">
              <p className="text-text-primary font-medium mb-1">Snip — Legal Team</p>
              <p className="text-text-secondary text-sm">
                Email: mohammedsaad0462@gmail.com
              </p>
            </div>
          </Section>
        </div>
      </article>

      {/* Footer */}
      <footer className="w-full py-8 bg-[#F5EFE6] border-t border-border">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Snip" width={20} height={20} />
            <span className="font-medium text-text-primary text-sm">
              © {new Date().getFullYear()} Snip
            </span>
          </div>
          <div className="flex gap-6 text-sm text-text-secondary">
            <Link
              href="/termsofservice"
              className="hover:text-primary font-medium transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacystatement"
              className="hover:text-primary font-medium transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ──────────────────────────────────────────────────────── */
/* Reusable section component for legal document structure */
/* ──────────────────────────────────────────────────────── */

function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-baseline gap-3 mb-4">
        <span className="text-[13px] font-mono text-primary font-medium">
          {number.padStart(2, "0")}
        </span>
        <h2 className="font-sans font-semibold text-[20px] text-text-primary">
          {title}
        </h2>
      </div>
      <div className="legal-body text-text-secondary text-[15px] leading-[1.8] space-y-3 pl-9">
        {children}
      </div>
    </section>
  );
}
