import { Link } from "react-router-dom";

export default function About() {
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
            data-testid="about-page-title"
            className="text-3xl md:text-4xl font-semibold text-neutral-950 tracking-tight mt-6"
          >
            About
          </h1>
        </header>

        <article className="prose prose-neutral max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Simple Image to PDF Conversion</h2>
            <p className="text-neutral-600 leading-relaxed">
              This website provides a simple online tool to convert images into PDF files. Whether you need to combine multiple photos into a single document, create a PDF portfolio, or simply convert an image to PDF format, our tool makes it quick and easy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">No Registration Required</h2>
            <p className="text-neutral-600 leading-relaxed">
              Our service is completely free to use and requires no registration, account creation, or login. You can start converting your images immediately without providing any personal information. There are no hidden fees, subscriptions, or premium tiers.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">No Software Installation</h2>
            <p className="text-neutral-600 leading-relaxed">
              Everything works directly in your web browser. There is no need to download or install any software, plugins, or applications. Simply visit the website, upload your images, and download your PDF. It's that simple.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Works on All Devices</h2>
            <p className="text-neutral-600 leading-relaxed">
              Our tool is designed to work seamlessly on both desktop computers and mobile devices. Whether you're using a Windows PC, Mac, iPhone, iPad, or Android device, you can convert images to PDF from anywhere with an internet connection.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Secure and Private</h2>
            <p className="text-neutral-600 leading-relaxed">
              Your privacy is important to us. All files you upload are processed securely and are automatically deleted immediately after conversion. We do not store, view, or share your images or generated PDFs. Your files remain your files.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-3">Supported Formats</h2>
            <p className="text-neutral-600 leading-relaxed">
              Our converter supports the most common image formats including JPG, JPEG, PNG, and WEBP. You can upload up to 20 images at once, and they will be combined into a single PDF document in the order they were uploaded.
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
