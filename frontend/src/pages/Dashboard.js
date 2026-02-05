import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';
import { User, FileText, Link as LinkIcon, MessageCircle, LogOut, Plus, Trash2, ExternalLink, Copy, Check, Upload } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const { user, logout, getAuthHeader, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [username, setUsername] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeType, setResumeType] = useState('link');
  const [portfolioLinks, setPortfolioLinks] = useState([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, { headers: getAuthHeader() });
      const data = response.data;
      setProfile(data);
      setName(data.name || '');
      setTitle(data.title || '');
      setBio(data.bio || '');
      setUsername(data.username || '');
      setWhatsapp(data.whatsapp || '');
      setResumeUrl(data.resume_type === 'link' ? data.resume_url || '' : '');
      setResumeType(data.resume_type || 'link');
      setPortfolioLinks(data.portfolio_links || []);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSaving(true);
    try {
      const updateData = {
        name: name,
        title: title || null,
        bio: bio || null,
        username: username || null,
        whatsapp: whatsapp || null,
        portfolio_links: portfolioLinks
      };
      if (resumeType === 'link') {
        updateData.resume_url = resumeUrl || null;
        updateData.resume_type = resumeUrl ? 'link' : null;
      }
      const response = await axios.put(`${API_URL}/profile`, updateData, { headers: getAuthHeader() });
      setProfile(response.data);
      toast.success('Profile saved!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Max 5MB allowed');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(`${API_URL}/profile/resume`, formData, {
        headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
      });
      setResumeType('upload');
      setResumeUrl('');
      setProfile(prev => ({ ...prev, resume_url: response.data.resume_url, resume_type: 'upload' }));
      toast.success('Resume uploaded!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const addLink = () => {
    if (!newLinkTitle.trim() || !newLinkUrl.trim()) {
      toast.error('Fill both fields');
      return;
    }
    try {
      new URL(newLinkUrl);
    } catch {
      toast.error('Invalid URL');
      return;
    }
    setPortfolioLinks([...portfolioLinks, { id: crypto.randomUUID(), title: newLinkTitle, url: newLinkUrl }]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const removeLink = (id) => {
    setPortfolioLinks(portfolioLinks.filter(l => l.id !== id));
  };

  const copyLink = () => {
    if (!profile?.username) {
      toast.error('Set username first');
      return;
    }
    navigator.clipboard.writeText(`${window.location.origin}/${profile.username}`);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-gray-500">Loading...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900" data-testid="logo-link">JobLink</Link>
          <div className="flex items-center gap-3">
            {profile?.username && (
              <Link to={`/${profile.username}`} target="_blank">
                <Button variant="ghost" size="sm" data-testid="view-profile-btn"><ExternalLink className="w-4 h-4 mr-2" />View</Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={() => { logout(); navigate('/'); }} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" />Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {profile?.username && (
          <Card className="mb-6 border-blue-200 bg-blue-50" data-testid="profile-link-card">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-700 font-medium mb-1">Your public link</p>
                  <p className="text-gray-900 font-mono text-sm truncate" data-testid="profile-url">{window.location.origin}/{profile.username}</p>
                </div>
                <Button onClick={copyLink} variant="outline" size="sm" className="border-blue-300 text-blue-700" data-testid="copy-link-btn">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}{copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6" data-testid="basic-info-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><User className="w-5 h-5" />Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" data-testid="name-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center"><span className="text-gray-500 text-sm mr-1">/</span>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="johndoe" data-testid="username-input" /></div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Software Developer" data-testid="title-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="About yourself..." rows={3} data-testid="bio-input" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="contact-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><MessageCircle className="w-5 h-5" />WhatsApp</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input id="whatsapp" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+91 9876543210" data-testid="whatsapp-input" />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="resume-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><FileText className="w-5 h-5" />Resume</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button variant={resumeType === 'upload' ? 'default' : 'outline'} onClick={() => setResumeType('upload')} className={resumeType === 'upload' ? 'bg-blue-600' : ''} data-testid="resume-upload-tab">Upload PDF</Button>
              <Button variant={resumeType === 'link' ? 'default' : 'outline'} onClick={() => setResumeType('link')} className={resumeType === 'link' ? 'bg-blue-600' : ''} data-testid="resume-link-tab">External Link</Button>
            </div>
            {resumeType === 'upload' ? (
              <div className="space-y-3">
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf" className="hidden" data-testid="resume-file-input" />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-20 border-dashed" data-testid="upload-resume-btn">
                  <Upload className="w-5 h-5 mr-2" />{uploading ? 'Uploading...' : 'Upload PDF (max 5MB)'}
                </Button>
                {profile?.resume_type === 'upload' && <p className="text-sm text-green-600 flex items-center gap-1"><Check className="w-4 h-4" />Resume uploaded</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="resume_url">Resume Link</Label>
                <Input id="resume_url" value={resumeUrl} onChange={(e) => setResumeUrl(e.target.value)} placeholder="https://drive.google.com/..." data-testid="resume-url-input" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6" data-testid="portfolio-card">
          <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><LinkIcon className="w-5 h-5" />Portfolio Links</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {portfolioLinks.length > 0 && (
              <div className="space-y-2">
                {portfolioLinks.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-md" data-testid={`portfolio-link-${link.id}`}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{link.title}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeLink(link.id)} className="text-red-500 hover:text-red-700" data-testid={`remove-link-${link.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            )}
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium">Add new link</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)} placeholder="GitHub" data-testid="new-link-title" />
                <Input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} placeholder="https://github.com/..." data-testid="new-link-url" />
              </div>
              <Button variant="outline" onClick={addLink} data-testid="add-link-btn"><Plus className="w-4 h-4 mr-2" />Add Link</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-8" data-testid="save-profile-btn">{saving ? 'Saving...' : 'Save Profile'}</Button>
        </div>
      </main>
    </div>
  );
}
