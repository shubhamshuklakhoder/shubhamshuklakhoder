import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import axios from 'axios';
import { FileText, MessageCircle, ExternalLink, Mail } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PublicProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/p/${username}`)
      .then(res => setProfile(res.data))
      .catch(err => setError(err.response?.status === 404 ? 'Profile not found' : 'Error'))
      .finally(() => setLoading(false));
  }, [username]);

  const openWhatsApp = () => {
    if (profile?.whatsapp) {
      window.open(`https://wa.me/${profile.whatsapp.replace(/[^\d+]/g, '')}`, '_blank');
    }
  };

  const openResume = () => {
    if (profile?.resume_url) {
      if (profile.resume_url.startsWith('data:')) {
        const win = window.open();
        win.document.write(`<iframe src="${profile.resume_url}" frameborder="0" style="border:0;top:0;left:0;bottom:0;right:0;width:100%;height:100%;" allowfullscreen></iframe>`);
      } else {
        window.open(profile.resume_url, '_blank');
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-2" data-testid="error-title">{error}</h1>
        <p className="text-gray-600 mb-6" data-testid="error-desc">The profile doesn't exist.</p>
        <Link to="/"><Button data-testid="go-home-btn" className="bg-blue-600 hover:bg-blue-700 text-white">Go to JobLink</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto min-h-screen bg-white md:my-8 md:rounded-xl md:border md:border-gray-200 md:shadow-sm md:min-h-0">
        <div className="p-6 md:p-8" data-testid="public-profile">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold" data-testid="profile-avatar">
              {profile.name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1" data-testid="profile-name">{profile.name}</h1>
            {profile.title && <p className="text-gray-600" data-testid="profile-title">{profile.title}</p>}
          </div>
          {profile.bio && <p className="text-gray-600 text-center mb-8 leading-relaxed" data-testid="profile-bio">{profile.bio}</p>}
          
          <div className="space-y-3 mb-8">
            {profile.resume_url && (
              <Button onClick={openResume} className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base" data-testid="view-resume-btn">
                <FileText className="w-5 h-5 mr-2" />View Resume
              </Button>
            )}
            {profile.whatsapp && (
              <Button onClick={openWhatsApp} className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base" data-testid="whatsapp-btn">
                <MessageCircle className="w-5 h-5 mr-2" />Contact on WhatsApp
              </Button>
            )}
            {profile.whatsapp && (
              <Button onClick={openWhatsApp} variant="outline" className="w-full h-12 text-base border-2 border-blue-600 text-blue-600 hover:bg-blue-50" data-testid="apply-btn">
                <Mail className="w-5 h-5 mr-2" />I'm Interested in Hiring
              </Button>
            )}
          </div>

          {profile.portfolio_links && profile.portfolio_links.length > 0 && (
            <div data-testid="portfolio-section">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Portfolio & Links</h2>
              <div className="space-y-2">
                {profile.portfolio_links.map((link, i) => (
                  <a key={link.id || i} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100" data-testid={`portfolio-link-${i}`}>
                    <span className="font-medium text-gray-900">{link.title}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-blue-600" data-testid="powered-by">Powered by JobLink</a>
          </div>
        </div>
      </main>
    </div>
  );
}
