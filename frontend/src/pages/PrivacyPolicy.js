import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
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
            data-testid="privacy-page-title"
            className="text-3xl md:text-4xl font-semibold text-neutral-950 tracking-tight mt-6"
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-400 mt-2">Last updated: January 2026</p>
        </header>

        <article className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">No Account Required</h2>
            <p className="text-neutral-600 leading-relaxed">
              Our Image to PDF Converter does not require account creation, registration, or login. We do not collect personal information such as names, email addresses, or passwords. You can use our service freely without providing any personal data.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Image Processing</h2>
            <p className="text-neutral-600 leading-relaxed">
              When you upload images to our service, they are processed solely for the purpose of converting them into a PDF document. Your images are temporarily stored in memory during the conversion process and are not saved to any permanent storage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Automatic File Deletion</h2>
            <p className="text-neutral-600 leading-relaxed">
              All uploaded files are automatically deleted immediately after the PDF conversion is complete. We do not retain, store, or archive any of your uploaded images or generated PDF files. Once you download your PDF or leave the page, your files are permanently removed from our servers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Cookies and Advertising</h2>
            <p className="text-neutral-600 leading-relaxed">
              Our website may use cookies to improve your browsing experience and for analytics purposes. We may also use third-party advertising services, such as Google AdSense, which may place cookies on your device to serve personalized advertisements. These third-party services have their own privacy policies governing the use of cookies and data collection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Data Security</h2>
            <p className="text-neutral-600 leading-relaxed">
              We implement reasonable security measures to protect any data processed through our service. All data transfers are encrypted using HTTPS. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Policy Updates</h2>
            <p className="text-neutral-600 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this page periodically for the latest information on our privacy practices.
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
