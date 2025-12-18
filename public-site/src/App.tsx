import { Route, Switch, Redirect } from 'wouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Shop from './pages/Shop';
import Contact from './pages/Contact';
import LogoPreview from './pages/LogoPreview';

// Dashboard URL - MUST be configured via VITE_DASHBOARD_URL environment variable
// This prevents accidentally redirecting users back to the marketing site
const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL;

if (!DASHBOARD_URL) {
  console.error(
    'CRITICAL: VITE_DASHBOARD_URL is not set! Portal redirects will not work.\n' +
    'Please set VITE_DASHBOARD_URL in your .env file.\n' +
    'Example: VITE_DASHBOARD_URL=http://localhost:5000 (development)\n' +
    'Example: VITE_DASHBOARD_URL=https://app.verihealth.com (production)'
  );
}

// Portal redirect component with auth-aware logic
function PortalRedirect() {
  // Check if user is authenticated by checking for auth token
  // This matches the dashboard's authentication setup
  const authToken = localStorage.getItem('verihealth_auth_token');
  const userJson = localStorage.getItem('verihealth_user');
  
  let user = null;
  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      // Invalid user data
    }
  }

  // Show error if DASHBOARD_URL is not configured
  if (!DASHBOARD_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="max-w-md bg-white rounded-lg shadow-lg p-6 border-2 border-red-500">
          <h1 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h1>
          <p className="text-gray-700 mb-4">
            The dashboard URL is not configured. Please set <code className="bg-gray-100 px-1 py-0.5 rounded">VITE_DASHBOARD_URL</code> in your environment variables.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Development:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">VITE_DASHBOARD_URL=http://localhost:5000</code>
          </p>
          <p className="text-sm text-gray-600 mt-2">
            <strong>Production:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">VITE_DASHBOARD_URL=https://app.verihealth.com</code>
          </p>
        </div>
      </div>
    );
  }

  // Determine redirect behavior based on user state
  if (authToken && user) {
    // User is logged in - check their role
    if (user.role === 'clinician' || user.role === 'admin') {
      // Clinician/admin - redirect to dashboard root
      window.location.href = DASHBOARD_URL + '/';
      return null;
    } else {
      // Patient or wrong role - redirect back to public site home
      window.location.href = '/';
      return null;
    }
  } else {
    // Not logged in - redirect to dashboard root where Supabase Auth will prompt login
    window.location.href = DASHBOARD_URL + '/';
    return null;
  }
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/about" component={About} />
          <Route path="/shop" component={Shop} />
          <Route path="/contact" component={Contact} />
          <Route path="/portal" component={PortalRedirect} />
          <Route path="/logo-preview" component={LogoPreview} />
          <Route>
            {/* 404 - Redirect to home */}
            <Redirect to="/" />
          </Route>
        </Switch>
      </main>
      <Footer />
    </div>
  );
}

export default App;
