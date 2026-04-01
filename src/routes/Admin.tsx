import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { AdminRestaurants } from './AdminRestaurants';
import { AdminRestaurantForm } from './AdminRestaurantForm';
import { AdminCrawlMessages } from './AdminCrawlMessages';
import { AdminConditions } from './AdminConditions';
import { AdminCuisines } from './AdminCuisines';
import { AdminNeighborhoods } from './AdminNeighborhoods';
import { AdminPages } from './AdminPages';

export function Admin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const { path, route } = useLocation();

  // Check session on mount
  useEffect(() => {
    fetch('/api/admin/session')
      .then(r => r.json())
      .then(data => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    setError('');

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      setAuthenticated(true);
    } else {
      setError('Invalid password');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    route('/admin');
  };

  // Loading state
  if (authenticated === null) {
    return <div class="admin-panel"><p>Loading...</p></div>;
  }

  // Login form
  if (!authenticated) {
    return (
      <div class="admin-panel">
        <div class="admin-login">
          <h1>Admin Login</h1>
          {error && <p class="admin-error">{error}</p>}
          <form onSubmit={handleLogin}>
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Log In</button>
          </form>
        </div>
      </div>
    );
  }

  // Route content based on path
  const subPath = path.replace(/^\/admin\/?/, '');
  const editMatch = subPath.match(/^restaurants\/(\d+)\/edit$/);

  let content;
  if (subPath === '' || subPath === '/') {
    content = <AdminDashboard />;
  } else if (subPath === 'restaurants') {
    content = <AdminRestaurants />;
  } else if (subPath === 'restaurants/new') {
    content = <AdminRestaurantForm />;
  } else if (editMatch) {
    content = <AdminRestaurantForm />;
  } else if (subPath === 'crawl-messages') {
    content = <AdminCrawlMessages />;
  } else if (subPath === 'conditions') {
    content = <AdminConditions />;
  } else if (subPath === 'cuisines') {
    content = <AdminCuisines />;
  } else if (subPath === 'neighborhoods') {
    content = <AdminNeighborhoods />;
  } else if (subPath === 'pages') {
    content = <AdminPages />;
  } else {
    content = <AdminDashboard />;
  }

  return (
    <div class="admin-panel">
      <div class="admin-header">
        <nav class="admin-nav">
          <a href="/admin">Dashboard</a>
          <a href="/admin/restaurants">Restaurants</a>
          <a href="/admin/crawl-messages">Crawl Messages</a>
          <a href="/admin/conditions">Conditions</a>
          <a href="/admin/cuisines">Cuisines</a>
          <a href="/admin/neighborhoods">Neighborhoods</a>
          <a href="/admin/pages">Pages</a>
        </nav>
        <button class="admin-logout" onClick={handleLogout}>Log Out</button>
      </div>
      {content}
    </div>
  );
}

function AdminDashboard() {
  return (
    <div class="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <ul>
        <li><a href="/admin/restaurants">Manage Restaurants</a></li>
        <li><a href="/admin/crawl-messages">Manage Crawl Messages</a></li>
        <li><a href="/admin/conditions">Manage Conditions</a></li>
        <li><a href="/admin/cuisines">Manage Cuisines</a></li>
        <li><a href="/admin/neighborhoods">Manage Neighborhoods</a></li>
        <li><a href="/admin/pages">Manage Pages</a></li>
      </ul>
    </div>
  );
}
