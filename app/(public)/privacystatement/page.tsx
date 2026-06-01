import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Statement — Snip",
  description:
    "Learn how Snip collects, uses, and protects your personal information. Our privacy practices are transparent and designed to keep your data safe.",
};

export default function PrivacyStatementPage() {
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
            Privacy Statement
          </h1>
          <div className="flex items-center justify-center gap-4 text-sm text-text-tertiary">
            <span>Effective: {effectiveDate}</span>
            <span className="w-1 h-1 bg-text-tertiary rounded-full" />
            <span>Last updated: {lastUpdated}</span>
          </div>
        </div>

        {/* Intro */}
        <div className="bg-surface border border-border rounded-[16px] p-6 mb-14 shadow-sm">
          <p className="text-text-secondary text-[15px] leading-[1.8]">
            At Snip, we believe privacy is a fundamental right. This Privacy 
            Statement explains what data we collect, why we collect it, how we 
            use it, and your rights regarding that data. We are committed to 
            transparency and to protecting your personal information.
          </p>
        </div>

        {/* Body */}
        <div className="prose-editorial">
          <Section number="1" title="Information We Collect">
            <h3>1.1 Account Information</h3>
            <p>
              When you create an account through our authentication provider 
              (Clerk), we receive and store:
            </p>
            <ul>
              <li><strong>Email address</strong> — used for account identification and communication</li>
              <li><strong>Authentication identifier</strong> — a unique ID from Clerk to link your account</li>
              <li><strong>Account creation date</strong> — for record keeping</li>
            </ul>
            <p>
              We do <strong>not</strong> store passwords. Authentication is 
              handled entirely by Clerk&apos;s secure infrastructure.
            </p>

            <h3>1.2 Link Data</h3>
            <p>When you create a shortened link, we store:</p>
            <ul>
              <li>The original (destination) URL</li>
              <li>The generated or custom short code</li>
              <li>An auto-fetched page title (for display purposes only)</li>
              <li>Creation and modification timestamps</li>
              <li>Active/inactive status</li>
              <li>Password hash (if password protection is enabled — the password itself is never stored)</li>
              <li>Expiration date (if set)</li>
            </ul>

            <h3>1.3 Click Analytics Data</h3>
            <p>
              When someone clicks a shortened link, we collect the following 
              aggregate analytics data:
            </p>
            <ul>
              <li><strong>IP address hash</strong> — your IP is irreversibly hashed using HMAC-SHA256 with a secret salt before storage. We cannot reverse this hash to recover your IP address.</li>
              <li><strong>Country and city</strong> — derived from geo-IP headers provided by our hosting platform (Vercel). We do not use third-party geo-IP databases.</li>
              <li><strong>Device type</strong> — mobile, tablet, or desktop (parsed from the User-Agent string)</li>
              <li><strong>Browser and OS</strong> — e.g., Chrome, Firefox, Windows, macOS (parsed from the User-Agent string)</li>
              <li><strong>Referrer</strong> — the website that referred the click (if available)</li>
              <li><strong>Timestamp</strong> — when the click occurred</li>
            </ul>

            <h3>1.4 Information We Do NOT Collect</h3>
            <ul>
              <li>Passwords (handled by Clerk)</li>
              <li>Payment information (the service is free)</li>
              <li>Raw IP addresses (always hashed before storage)</li>
              <li>Cookies for tracking across sites</li>
              <li>Browsing history beyond the single redirect event</li>
              <li>Personal demographic information (age, gender, etc.)</li>
            </ul>
          </Section>

          <Section number="2" title="How We Use Your Information">
            <p>We use the information we collect for the following purposes:</p>
            <DataTable
              rows={[
                { purpose: "Provide the Service", data: "Account info, link data", basis: "Service operation" },
                { purpose: "Display analytics", data: "Click data (aggregated)", basis: "Feature delivery" },
                { purpose: "Prevent abuse", data: "IP hashes, link content", basis: "Legitimate interest" },
                { purpose: "Improve the Service", data: "Usage patterns (aggregated)", basis: "Legitimate interest" },
                { purpose: "Communicate with you", data: "Email address", basis: "Account management" },
              ]}
            />
            <p>
              We do <strong>not</strong> use your data for advertising, profiling, 
              or selling to third parties.
            </p>
          </Section>

          <Section number="3" title="Data Sharing & Third Parties">
            <p>
              We share data with the following third-party services, which are 
              essential to operating the Service:
            </p>
            <DataTable
              rows={[
                { purpose: "Clerk", data: "Authentication data", basis: "Account sign-in/up" },
                { purpose: "CockroachDB / Neon", data: "All stored data (encrypted)", basis: "Database hosting" },
                { purpose: "Vercel", data: "Request headers, geo-IP", basis: "App hosting & CDN" },
              ]}
            />
            <p>
              We do <strong>not</strong> share your data with advertisers, data 
              brokers, or analytics platforms. We do not embed third-party 
              tracking scripts in the Service.
            </p>
            <p>
              We may disclose information if required by law, court order, or 
              governmental regulation, or if we believe disclosure is necessary 
              to protect our rights, your safety, or the safety of others.
            </p>
          </Section>

          <Section number="4" title="Data Retention">
            <ul>
              <li><strong>Account data</strong> — retained for the lifetime of your account. Deleted when you delete your account.</li>
              <li><strong>Link data</strong> — retained for the lifetime of the link. Anonymous links may be removed after extended periods of inactivity.</li>
              <li><strong>Click analytics</strong> — retained for as long as the associated link exists. When a link is deleted, its click data is cascade-deleted.</li>
              <li><strong>Hashed IP addresses</strong> — retained with click data. Since they are irreversibly hashed, they cannot be used to identify individuals.</li>
            </ul>
          </Section>

          <Section number="5" title="Data Security">
            <p>
              We implement the following security measures to protect your data:
            </p>
            <ul>
              <li><strong>Encryption in transit</strong> — all data is transmitted over HTTPS/TLS</li>
              <li><strong>Encryption at rest</strong> — our database provider encrypts all stored data</li>
              <li><strong>IP hashing</strong> — IP addresses are irreversibly hashed using HMAC-SHA256 with a server-side secret before storage</li>
              <li><strong>Password hashing</strong> — link passwords are hashed with bcrypt (cost factor 10) before storage</li>
              <li><strong>No plain-text secrets</strong> — all sensitive configuration is stored in environment variables, never in code</li>
              <li><strong>Authentication delegation</strong> — Clerk handles all authentication, session management, and credential storage</li>
            </ul>
            <p>
              While we take reasonable precautions, no method of electronic 
              storage or transmission is 100% secure. We cannot guarantee 
              absolute security.
            </p>
          </Section>

          <Section number="6" title="Your Rights">
            <p>
              Depending on your jurisdiction, you may have the following rights 
              regarding your personal data:
            </p>
            <ul>
              <li><strong>Access</strong> — request a copy of the data we hold about you</li>
              <li><strong>Correction</strong> — request correction of inaccurate data</li>
              <li><strong>Deletion</strong> — request deletion of your account and associated data</li>
              <li><strong>Export</strong> — request your data in a portable format</li>
              <li><strong>Objection</strong> — object to certain types of data processing</li>
              <li><strong>Restriction</strong> — request restriction of processing in certain circumstances</li>
            </ul>
            <p>
              To exercise any of these rights, please contact us at the email 
              address below. We will respond within 30 days.
            </p>
          </Section>

          <Section number="7" title="Cookies & Local Storage">
            <p>
              Snip uses minimal client-side storage:
            </p>
            <ul>
              <li><strong>Authentication cookies</strong> — set by Clerk to maintain your logged-in session. These are strictly necessary and cannot be disabled while using authenticated features.</li>
              <li><strong>No tracking cookies</strong> — we do not use cookies for analytics, advertising, or cross-site tracking.</li>
              <li><strong>No local storage abuse</strong> — we do not store tracking identifiers in localStorage or sessionStorage.</li>
            </ul>
          </Section>

          <Section number="8" title="Children's Privacy">
            <p>
              The Service is not intended for use by children under the age of 13. 
              We do not knowingly collect personal information from children under 
              13. If we discover that we have inadvertently collected such information, 
              we will take steps to delete it promptly. If you believe a child under 
              13 has provided us with personal data, please contact us immediately.
            </p>
          </Section>

          <Section number="9" title="International Data Transfers">
            <p>
              Your data may be stored and processed in regions where our 
              infrastructure providers operate, including the United States and 
              European Union. By using the Service, you consent to the transfer 
              of your data to these regions. Our providers maintain appropriate 
              safeguards for international data transfers.
            </p>
          </Section>

          <Section number="10" title="Changes to This Statement">
            <p>
              We may update this Privacy Statement periodically. When we make 
              material changes, we will:
            </p>
            <ul>
              <li>Update the &ldquo;Last updated&rdquo; date at the top of this page</li>
              <li>Notify registered users via email for significant changes</li>
              <li>Provide a prominent notice on the Service</li>
            </ul>
            <p>
              We encourage you to review this page periodically to stay informed 
              about our privacy practices.
            </p>
          </Section>

          <Section number="11" title="Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy 
              Statement or your personal data, please contact us:
            </p>
            <div className="bg-[#F5EFE6] border border-border rounded-[12px] p-5 mt-3">
              <p className="text-text-primary font-medium mb-1">Snip — Privacy Team</p>
              <p className="text-text-secondary text-sm">
                Email: mohammedsaad0462@gmail.com
              </p>
            </div>
          </Section>
        </div>

        {/* Cross-link */}
        <div className="mt-16 pt-8 border-t border-border text-center">
          <p className="text-sm text-text-tertiary mb-2">See also</p>
          <Link
            href="/termsofservice"
            className="text-primary hover:text-primary-hover font-medium text-[15px] underline underline-offset-2"
          >
            Terms of Service →
          </Link>
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
/* Reusable components                                     */
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

function DataTable({
  rows,
}: {
  rows: Array<{ purpose: string; data: string; basis: string }>;
}) {
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="text-left py-2.5 pr-4 text-text-primary font-medium text-[13px] uppercase tracking-wider">
              Purpose / Provider
            </th>
            <th className="text-left py-2.5 pr-4 text-text-primary font-medium text-[13px] uppercase tracking-wider">
              Data
            </th>
            <th className="text-left py-2.5 text-text-primary font-medium text-[13px] uppercase tracking-wider">
              Legal Basis
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-b border-border/60 last:border-none"
            >
              <td className="py-2.5 pr-4 text-text-primary font-medium">
                {row.purpose}
              </td>
              <td className="py-2.5 pr-4 text-text-secondary">
                {row.data}
              </td>
              <td className="py-2.5 text-text-tertiary text-[13px]">
                {row.basis}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
