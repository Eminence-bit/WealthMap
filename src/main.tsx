
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Clerk publishable key from environment variables or direct value
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aGFuZHktY2F0LTUwLmNsZXJrLmFjY291bnRzLmRldiQ';

if (!clerkPubKey && import.meta.env.MODE === 'production') {
  console.error('Missing Clerk publishable key');
}

createRoot(document.getElementById('root')!).render(
  <ClerkProvider publishableKey={clerkPubKey}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>
);
