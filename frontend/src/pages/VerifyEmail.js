import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import axios from 'axios';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      await axios.post(`${API_URL}/auth/verify-email?token=${token}`);
      setStatus('success');
      setMessage('Your email has been verified successfully!');
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'Verification failed. The link may be invalid or expired.');
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
        <Card className="w-full max-w-[400px] shadow-sm" data-testid="verify-card">
          <CardHeader className="text-center">
            {status === 'loading' && <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />}
            {status === 'success' && <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />}
            {status === 'error' && <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />}
            <CardTitle className="text-2xl font-semibold" data-testid="verify-title">
              {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
            </CardTitle>
            <CardDescription data-testid="verify-message">{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {status === 'success' && (
              <Button onClick={() => navigate('/dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="go-dashboard-btn">
                Go to Dashboard
              </Button>
            )}
            {status === 'error' && (
              <Link to="/login">
                <Button variant="outline" data-testid="go-login-btn">Back to Login</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
