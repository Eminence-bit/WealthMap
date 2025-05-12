
import React, { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { ErrorAlert } from './ErrorAlert';

export function OnboardingForm() {
  const { signIn, isLoaded } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMfa, setShowMfa] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) {
      setError('Authentication system is not ready yet');
      return;
    }

    if (!termsAccepted) {
      setError('Please accept the terms and conditions');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      if (!showMfa) {
        // First step: attempt sign in with email and password
        const result = await signIn.create({
          identifier: email,
          password,
        });
        
        if (result.status === 'complete') {
          // Successful login without MFA
          window.location.href = '/map';
        } else if (result.status === 'needs_second_factor') {
          // MFA is required
          setShowMfa(true);
        } else {
          setError('Something went wrong during sign in');
        }
      } else {
        // Second step: verify MFA code
        const result = await signIn.attemptSecondFactor({
          strategy: 'phone_code',
          code: mfaCode,
        });
        
        if (result.status === 'complete') {
          window.location.href = '/map';
        } else {
          setError('Invalid MFA code');
        }
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-xl shadow-lg max-w-md w-full">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-wealthmap-dark">
            Wealth Map Challenge
          </h1>
          <p className="text-gray-500">Employee Portal</p>
        </div>
        
        {error && <ErrorAlert message={error} />}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!showMfa ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wealthmap-primary"
                  required
                  aria-label="Email"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wealthmap-primary"
                  required
                  minLength={8}
                  aria-label="Password"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  id="terms"
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="h-4 w-4 text-wealthmap-primary border-gray-300 rounded focus:ring-wealthmap-primary"
                  required
                  aria-label="Accept Terms"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                  I agree to the <a href="#" className="text-wealthmap-primary hover:underline">Terms of Service</a> and <a href="#" className="text-wealthmap-primary hover:underline">Privacy Policy</a>
                </label>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="mfa-code" className="block text-sm font-medium text-gray-700 mb-1">
                Authentication Code
              </label>
              <input
                id="mfa-code"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                placeholder="Enter your 6-digit code"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-wealthmap-primary"
                required
                aria-label="MFA Code"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the verification code sent to your phone
              </p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isLoading || (!showMfa && (!email || !password || !termsAccepted))}
            className="w-full bg-wealthmap-primary hover:bg-blue-600 text-white font-medium p-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wealthmap-primary disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={showMfa ? "Verify" : "Login"}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : showMfa ? "Verify Code" : "Login"}
          </button>
          
          {showMfa && (
            <button
              type="button"
              onClick={() => setShowMfa(false)}
              className="w-full mt-2 text-wealthmap-primary hover:text-blue-700 bg-transparent p-2 rounded-md transition-colors"
            >
              Back to Login
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
