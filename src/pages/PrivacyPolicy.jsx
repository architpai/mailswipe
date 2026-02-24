import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-mono px-6 py-10 max-w-2xl mx-auto">
      <a
        href="/"
        className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 hover:text-black transition-colors mb-8"
      >
        &larr; BACK TO MAILSWIPE
      </a>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-2">
        PRIVACY POLICY
      </h1>
      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold mb-8">
        LAST UPDATED: FEBRUARY 24, 2026
      </p>

      <div className="space-y-6 text-sm text-black/70 leading-relaxed">
        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            1. WHAT IS MAILSWIPE
          </h2>
          <p>
            MailSwipe is a client-side web application that helps you triage your Gmail inbox
            using swipe gestures. The app runs entirely in your browser — there is no backend
            server, and your data never leaves your device.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            2. GOOGLE ACCOUNT ACCESS
          </h2>
          <p>
            MailSwipe uses Google OAuth 2.0 to authenticate your Google account.
            We request the following permissions (scopes):
          </p>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              <strong>gmail.modify</strong> — to read your emails and perform actions
              (keep, trash, archive) on your behalf
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              <strong>gmail.labels</strong> — to create and manage labels used by MailSwipe
            </li>
          </ul>
          <p className="mt-2">
            You can revoke MailSwipe's access at any time from your{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-black hover:text-[#ff0000] transition-colors"
            >
              Google Account permissions
            </a>.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            3. DATA WE ACCESS
          </h2>
          <p>When you use MailSwipe, the following data is accessed from your Gmail account:</p>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              Email metadata: sender, subject, date, and snippet
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Full email body (only when you open an email in the detail view)
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Unsubscribe headers (for one-tap unsubscribe)
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Your Google profile name (displayed in the app header)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            4. HOW DATA IS PROCESSED
          </h2>
          <p>
            All data processing happens entirely in your browser. MailSwipe has no backend
            server and does not transmit your email data to any external service.
          </p>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              <strong>AI classification and summarization</strong> — powered by machine learning
              models (Transformers.js) that run locally in your browser via Web Workers
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              <strong>Swipe prediction</strong> — a lightweight online learning model that runs
              in your browser and learns from your swipe patterns
            </li>
          </ul>
          <p className="mt-2">
            No email content, metadata, or classification results are ever sent to our servers
            or any third party.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            5. DATA STORED ON YOUR DEVICE
          </h2>
          <p>
            MailSwipe stores the following data in your browser's localStorage:
          </p>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              Your Google access token (for maintaining your session)
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Your swipe action preferences (settings)
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Swipe predictor model state (learned vocabulary and weights)
            </li>
          </ul>
          <p className="mt-2">
            You can clear all stored data at any time by clearing your browser's localStorage
            for this site, or by using your browser's "Clear site data" feature.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            6. THIRD-PARTY SERVICES
          </h2>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              <strong>Google APIs</strong> — used for authentication and Gmail access.
              Subject to{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-black hover:text-[#ff0000] transition-colors"
              >
                Google's Privacy Policy
              </a>.
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              <strong>Vercel Analytics</strong> — collects anonymous page performance metrics
              (load times, web vitals). No email content or personal data is included.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            7. DATA SHARING
          </h2>
          <p>
            MailSwipe does not sell, share, or transfer your data to any third party.
            Your email data is processed exclusively in your browser and is never stored
            on or transmitted to any server controlled by us.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            8. DATA RETENTION
          </h2>
          <p>
            Since MailSwipe has no backend, we do not retain any of your data. Data stored
            in your browser's localStorage persists until you clear it. Your Google access
            token expires according to Google's token policies.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            9. CHILDREN'S PRIVACY
          </h2>
          <p>
            MailSwipe is not intended for use by children under the age of 13. We do not
            knowingly collect personal information from children.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            10. CHANGES TO THIS POLICY
          </h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be reflected
            on this page with an updated "Last Updated" date.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            11. CONTACT
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:architpai.dev@gmail.com"
              className="underline font-bold text-black hover:text-[#ff0000] transition-colors"
            >
              architpai.dev@gmail.com
            </a>.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-6 border-t-[3px] border-black/10">
        <div className="flex gap-4 text-[10px] uppercase tracking-[0.15em] font-bold text-black/30">
          <a href="#/terms" className="hover:text-black transition-colors">TERMS OF SERVICE</a>
          <span>&middot;</span>
          <a href="/" className="hover:text-black transition-colors">MAILSWIPE</a>
        </div>
      </div>
    </div>
  );
}
