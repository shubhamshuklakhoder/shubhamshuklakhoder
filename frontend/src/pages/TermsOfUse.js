import { Link } from "react-router-dom";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        <header className="mb-10">
          <Link 
            to="/" 
            className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            data-testid="back-home-link"
          >
            ← Back to Home
          </Link>
          <h1 
            data-testid="terms-page-title"
            className="text-3xl md:text-4xl font-semibold text-neutral-950 tracking-tight mt-6"
          >
            Terms of Use
          </h1>
          <p className="text-sm text-neutral-400 mt-2">Last updated: January 2026</p>
        </header>

        <article className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Service Provided "As Is"</h2>
            <p className="text-neutral-600 leading-relaxed">
              The Image to PDF Converter service is provided on an "as is" and "as available" basis. We make no representations or warranties of any kind, express or implied, regarding the operation of this service or the information, content, or materials included therein.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">No Guarantees or Warranties</h2>
            <p className="text-neutral-600 leading-relaxed">
              We do not warrant that the service will be uninterrupted, error-free, or free of viruses or other harmful components. We do not guarantee the accuracy, completeness, or usefulness of any information provided through this service. Your use of the service is at your own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Limitation of Liability</h2>
            <p className="text-neutral-600 leading-relaxed">
              In no event shall we be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the service. This includes, but is not limited to, damages for loss of data, loss of profits, or any other intangible losses, even if we have been advised of the possibility of such damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Temporary File Processing</h2>
            <p className="text-neutral-600 leading-relaxed">
              Files uploaded to our service are processed temporarily and are automatically deleted after conversion. We do not store, backup, or retain any files beyond the immediate conversion process. You are solely responsible for maintaining your own copies of any files you upload.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Acceptable Use</h2>
            <p className="text-neutral-600 leading-relaxed">
              You agree not to misuse this service. Prohibited activities include but are not limited to: uploading illegal, harmful, or offensive content; attempting to interfere with the proper functioning of the service; using automated systems to overload the service; and attempting to gain unauthorized access to any part of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Acceptance of Terms</h2>
            <p className="text-neutral-600 leading-relaxed">
              By accessing and using this service, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use. If you do not agree with any part of these terms, you must not use the service. Continued use of the service constitutes acceptance of any updates or modifications to these terms.
            </p>
          </section>
        </article>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-100 bg-white py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6">
          <Link 
            to="/privacy-policy" 
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            to="/terms" 
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            Terms of Use
          </Link>
          <Link 
            to="/about" 
            className="text-sm text-neutral-500 hover:text-neutral-950 transition-colors"
          >
            About
          </Link>
        </div>
        <p className="text-xs text-neutral-300 text-center mt-4">
          A Shubham Shukla Production
        </p>
      </footer>
    </div>
  );
}
