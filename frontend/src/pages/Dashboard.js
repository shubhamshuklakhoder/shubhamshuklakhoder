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
import { 
  User, FileText, Link as LinkIcon, MessageCircle, LogOut, 
  Plus, Trash2, ExternalLink, Copy, Check, Upload
} from 'lucide-react';

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
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    bio: '',
    username: '',
    whatsapp: '',
    resume_url: '',
    resume_type: 'link',
    portfolio_links: []
  });
  
  const [newLink, setNewLink] = useState({ title: '', url: '' });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchProfile();
    }
  }, [user, authLoading, navigate]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`, {
        headers: getAuthHeader()
      });
      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        title: response.data.title || '',
        bio: response.data.bio || '',
        username: response.data.username || '',
        whatsapp: response.data.whatsapp || '',
        resume_url: response.data.resume_type === 'link' ? response.data.resume_url || '' : '',
        resume_type: response.data.resume_type || 'link',
        portfolio_links: response.data.portfolio_links || []
      });
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        title: formData.title || null,
        bio: formData.bio || null,
        username: formData.username || null,
        whatsapp: formData.whatsapp || null,
        portfolio_links: formData.portfolio_links
      };
      
      // Only update resume_url if it's a link type
      if (formData.resume_type === 'link') {
        updateData.resume_url = formData.resume_url || null;
        updateData.resume_type = formData.resume_url ? 'link' : null;
      }
      
      const response = await axios.put(`${API_URL}/profile`, updateData, {
        headers: getAuthHeader()
      });
      setProfile(response.data);
      toast.success('Profile saved successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to save profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Only PDF files are allowed');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/profile/resume`, formDataUpload, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ 
        ...prev, 
        resume_type: 'upload',
        resume_url: ''
      }));
      setProfile(prev => ({
        ...prev,
        resume_url: response.data.resume_url,
        resume_type: 'upload'
      }));
      toast.success('Resume uploaded successfully!');
    } catch (error) {
      const message = error.response?.data?.detail || 'Failed to upload resume';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const addPortfolioLink = () => {
    if (!newLink.title.trim() || !newLink.url.trim()) {
      toast.error('Please fill in both title and URL');
      return;
    }
    
    // Basic URL validation
    try {
      new URL(newLink.url);
    } catch {
      toast.error('Please enter a valid URL');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      portfolio_links: [...prev.portfolio_links, { ...newLink, id: crypto.randomUUID() }]
    }));
    setNewLink({ title: '', url: '' });
  };

  const removePortfolioLink = (id) => {
    setFormData(prev => ({
      ...prev,
      portfolio_links: prev.portfolio_links.filter(link => link.id !== id)
    }));
  };

  const copyProfileLink = () => {
    if (!profile?.username) {
      toast.error('Please set a username first');
      return;
    }
    const url = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const profileUrl = profile?.username ? `${window.location.origin}/${profile.username}` : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900" data-testid="logo-link">JobLink</Link>
          <div className="flex items-center gap-3">
            {profile?.username && (
              <Link to={`/${profile.username}`} target="_blank">
                <Button variant="ghost" size="sm" data-testid="view-profile-btn">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-2" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Link Card */}
        {profile?.username && (
          <Card className="mb-6 border-blue-200 bg-blue-50" data-testid="profile-link-card">
            <CardContent className="py-4">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blue-700 font-medium mb-1">Your public profile link</p>
                  <p className="text-gray-900 font-mono text-sm truncate" data-testid="profile-url">
                    {profileUrl}
                  </p>
                </div>
                <Button 
                  onClick={copyProfileLink}
                  variant="outline"
                  size="sm"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  data-testid="copy-link-btn"
                >
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Info */}
        <Card className="mb-6" data-testid="basic-info-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5" />
              Basic Information
            </CardTitle>
            <CardDescription>This information will be displayed on your public profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  data-testid="name-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-1">/</span>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') 
                    }))}
                    placeholder="johndoe"
                    data-testid="username-input"
                  />
                </div>
                <p className="text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Software Developer | React | Node.js"
                data-testid="title-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Short Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell recruiters about yourself in 2-3 sentences..."
                rows={3}
                data-testid="bio-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="mb-6" data-testid="contact-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageCircle className="w-5 h-5" />
              WhatsApp Contact
            </CardTitle>
            <CardDescription>Let recruiters reach you directly via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp Number</Label>
              <Input
                id="whatsapp"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                placeholder="+91 9876543210"
                data-testid="whatsapp-input"
              />
              <p className="text-xs text-gray-500">Include country code (e.g., +91 for India)</p>
            </div>
          </CardContent>
        </Card>

        {/* Resume */}
        <Card className="mb-6" data-testid="resume-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="w-5 h-5" />
              Resume
            </CardTitle>
            <CardDescription>Upload a PDF or link to your resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                variant={formData.resume_type === 'upload' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, resume_type: 'upload' }))}
                className={formData.resume_type === 'upload' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                data-testid="resume-upload-tab"
              >
                Upload PDF
              </Button>
              <Button
                variant={formData.resume_type === 'link' ? 'default' : 'outline'}
                onClick={() => setFormData(prev => ({ ...prev, resume_type: 'link' }))}
                className={formData.resume_type === 'link' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                data-testid="resume-link-tab"
              >
                External Link
              </Button>
            </div>
            
            {formData.resume_type === 'upload' ? (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                  data-testid="resume-file-input"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-20 border-dashed"
                  data-testid="upload-resume-btn"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploading ? 'Uploading...' : 'Click to upload PDF (max 5MB)'}
                </Button>
                {profile?.resume_type === 'upload' && profile?.resume_url && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    Resume uploaded successfully
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="resume_url">Resume Link</Label>
                <Input
                  id="resume_url"
                  value={formData.resume_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, resume_url: e.target.value }))}
                  placeholder="https://drive.google.com/your-resume"
                  data-testid="resume-url-input"
                />
                <p className="text-xs text-gray-500">Link to Google Drive, Dropbox, or any public URL</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Links */}
        <Card className="mb-6" data-testid="portfolio-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LinkIcon className="w-5 h-5" />
              Portfolio Links
            </CardTitle>
            <CardDescription>Add links to your projects, GitHub, LinkedIn, etc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Links */}
            {formData.portfolio_links.length > 0 && (
              <div className="space-y-2">
                {formData.portfolio_links.map((link) => (
                  <div 
                    key={link.id} 
                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-md"
                    data-testid={`portfolio-link-${link.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{link.title}</p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePortfolioLink(link.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      data-testid={`remove-link-${link.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Add New Link */}
            <Separator />
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-700">Add new link</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Link title (e.g., GitHub)"
                  data-testid="new-link-title"
                />
                <Input
                  value={newLink.url}
                  onChange={(e) => setNewLink(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://github.com/username"
                  data-testid="new-link-url"
                />
              </div>
              <Button
                variant="outline"
                onClick={addPortfolioLink}
                className="w-full md:w-auto"
                data-testid="add-link-btn"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3 pb-8">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            data-testid="save-profile-btn"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </main>
    </div>
  );
}
