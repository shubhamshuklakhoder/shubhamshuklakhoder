import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { FileText, MessageCircle, Link as LinkIcon, CheckCircle } from 'lucide-react';

export default function Landing() {
  const features = [
    { icon: FileText, title: 'Resume Hosting', description: 'Upload your PDF or link your resume' },
    { icon: LinkIcon, title: 'Portfolio Links', description: 'Showcase your work with custom links' },
    { icon: MessageCircle, title: 'WhatsApp Connect', description: 'One-tap contact for recruiters' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900" data-testid="logo">JobLink</h1>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" data-testid="login-nav-btn">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button data-testid="signup-nav-btn" className="bg-blue-600 hover:bg-blue-700 text-white">Sign up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6" data-testid="hero-title">
            Your Professional Bio in One Link
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed" data-testid="hero-subtitle">
            Create a single, shareable link for your resume, portfolio, and contact info. 
            Perfect for job seekers who want to make a great impression.
          </p>
          <Link to="/signup">
            <Button 
              size="lg" 
              data-testid="cta-btn"
              className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 text-lg"
            >
              Create Your Link - Free
            </Button>
          </Link>
          <p className="text-sm text-gray-500 mt-4">No credit card required</p>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8" data-testid="features-section">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm"
              data-testid={`feature-${index}`}
            >
              <feature.icon className="w-10 h-10 text-blue-600 mb-4" strokeWidth={1.5} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mt-24 text-center">
          <h3 className="text-3xl font-semibold text-gray-900 mb-12" data-testid="how-it-works-title">
            Simple & Fast
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Sign Up', desc: 'Create your account in seconds' },
              { step: '2', title: 'Add Info', desc: 'Fill in your details and upload resume' },
              { step: '3', title: 'Share', desc: 'Get your unique link to share' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center" data-testid={`step-${index}`}>
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mb-4">
                  {item.step}
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} JobLink. Built for job seekers in India.</p>
        </div>
      </footer>
    </div>
  );
}
