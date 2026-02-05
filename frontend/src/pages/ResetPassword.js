import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';
import { CheckCircle } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      await axios.post(`${API_URL}/auth/reset-password`, { token, password });
      setSuccess(true);
      toast.success('Password reset successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to reset password. Link may be expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
        <Link to="/forgot-password"><Button className="bg-blue-600 hover:bg-blue-700 text-white">Request New Link</Button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link to="/" className="text-2xl font-bold text-gray-900" data-testid="logo-link">JobLink</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-[400px] shadow-sm" data-testid="reset-card">
          <CardHeader className="text-center">
            {success && <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />}
            <CardTitle className="text-2xl font-semibold" data-testid="reset-title">
              {success ? 'Password Reset!' : 'Create new password'}
            </CardTitle>
            <CardDescription data-testid="reset-desc">
              {success ? 'You can now log in with your new password' : 'Enter your new password below'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <Button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700 text-white" data-testid="login-btn">
                Go to Login
              </Button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="reset-form">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} data-testid="password-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required data-testid="confirm-input" />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading} data-testid="submit-btn">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
