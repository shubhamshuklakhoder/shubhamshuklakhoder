import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
      toast.success('Check your email for reset instructions');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900" data-testid="logo-link">JobLink</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[400px] shadow-sm" data-testid="forgot-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold" data-testid="forgot-title">
              {sent ? 'Check your email' : 'Forgot password?'}
            </CardTitle>
            <CardDescription data-testid="forgot-desc">
              {sent ? 'We sent you a password reset link' : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <Mail className="w-12 h-12 mx-auto text-blue-600" />
                <p className="text-gray-600 text-sm">
                  If an account exists for {email}, you'll receive an email with instructions to reset your password.
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full" data-testid="back-login-btn">
                    <ArrowLeft className="w-4 h-4 mr-2" />Back to Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="forgot-form">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="email-input" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} data-testid="submit-btn">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <Link to="/login" className="block text-center text-sm text-gray-600 hover:text-blue-600" data-testid="back-link">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />Back to Login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
