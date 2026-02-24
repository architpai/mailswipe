import React from 'react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white font-mono px-6 py-10 max-w-2xl mx-auto">
      <a
        href="/"
        className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-black/40 hover:text-black transition-colors mb-8"
      >
        &larr; BACK TO MAILSWIPE
      </a>

      <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black mb-2">
        TERMS OF SERVICE
      </h1>
      <p className="text-[10px] uppercase tracking-[0.15em] text-black/40 font-bold mb-8">
        LAST UPDATED: FEBRUARY 24, 2026
      </p>

      <div className="space-y-6 text-sm text-black/70 leading-relaxed">
        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            1. ACCEPTANCE OF TERMS
          </h2>
          <p>
            By accessing or using MailSwipe ("the Service"), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            2. DESCRIPTION OF SERVICE
          </h2>
          <p>
            MailSwipe is a client-side web application that connects to your Gmail account
            via Google OAuth to help you triage your inbox using swipe gestures. The app
            runs entirely in your browser with no backend server.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            3. GOOGLE ACCOUNT
          </h2>
          <p>
            MailSwipe requires a Google account to function. By using the Service, you
            authorize MailSwipe to access your Gmail data as described in our{' '}
            <a
              href="#/privacy"
              className="underline font-bold text-black hover:text-[#ff0000] transition-colors"
            >
              Privacy Policy
            </a>.
            You are responsible for maintaining the security of your Google account.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            4. EMAIL ACTIONS
          </h2>
          <p>
            MailSwipe performs actions on your Gmail account (such as trashing, archiving,
            or labeling emails) based on your swipe input. While an undo feature is provided,
            you are solely responsible for the actions taken on your emails through the Service.
            MailSwipe is not liable for any unintended email deletions or modifications.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            5. AI-POWERED FEATURES
          </h2>
          <p>
            MailSwipe uses machine learning models running in your browser to classify and
            summarize emails. These AI-generated labels and summaries are provided for
            convenience and may not always be accurate. You should not rely solely on AI
            classifications for important email management decisions.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            6. ACCEPTABLE USE
          </h2>
          <p>You agree to use MailSwipe only for:</p>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              Personal email management and inbox triage
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Lawful purposes in compliance with all applicable laws
            </li>
          </ul>
          <p className="mt-2">You agree not to:</p>
          <ul className="list-none mt-2 space-y-1">
            <li className="pl-4 border-l-[3px] border-black/10">
              Reverse-engineer, decompile, or attempt to extract source code from the
              machine learning models
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Use the Service to send spam or conduct any form of abuse
            </li>
            <li className="pl-4 border-l-[3px] border-black/10">
              Attempt to gain unauthorized access to other users' data
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            7. DISCLAIMER OF WARRANTIES
          </h2>
          <p>
            MailSwipe is provided "AS IS" and "AS AVAILABLE" without warranties of any kind,
            either express or implied. We do not guarantee that the Service will be
            uninterrupted, error-free, or that any emails will be correctly classified
            or processed.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            8. LIMITATION OF LIABILITY
          </h2>
          <p>
            To the maximum extent permitted by law, MailSwipe and its creators shall not be
            liable for any indirect, incidental, special, consequential, or punitive damages,
            including but not limited to loss of data, loss of emails, or interruption of
            service, arising from your use of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            9. MODIFICATIONS
          </h2>
          <p>
            We reserve the right to modify these Terms at any time. Changes will be reflected
            on this page with an updated "Last Updated" date. Continued use of the Service
            after changes constitutes acceptance of the modified Terms.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            10. TERMINATION
          </h2>
          <p>
            You may stop using MailSwipe at any time by revoking its access from your{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-bold text-black hover:text-[#ff0000] transition-colors"
            >
              Google Account permissions
            </a>{' '}
            and clearing your browser's localStorage for this site.
          </p>
        </section>

        <section>
          <h2 className="text-sm font-black uppercase tracking-tight text-black mb-2">
            11. CONTACT
          </h2>
          <p>
            If you have questions about these Terms, please contact us at{' '}
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
          <a href="#/privacy" className="hover:text-black transition-colors">PRIVACY POLICY</a>
          <span>&middot;</span>
          <a href="/" className="hover:text-black transition-colors">MAILSWIPE</a>
        </div>
      </div>
    </div>
  );
}
