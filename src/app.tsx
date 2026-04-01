import { LocationProvider, Router, Route, useLocation } from 'preact-iso';
import { Shell } from './components/layout/Shell';
import { Home } from './routes/Home';
import { ConditionList } from './routes/ConditionList';
import { AllRestaurants } from './routes/AllRestaurants';
import { NeighborhoodMap } from './routes/NeighborhoodMap';
import { NeighborhoodList } from './routes/NeighborhoodList';
import { RestaurantDetail } from './routes/RestaurantDetail';
import { About } from './routes/About';
import { NotFound } from './routes/NotFound';
import { Admin } from './routes/Admin';

function AppRoutes() {
  const { path } = useLocation();

  // Admin pages render outside Shell — no CRT effects, no header/crawl bar
  if (path.startsWith('/admin')) {
    return (
      <Router>
        <Route path="/admin" component={Admin} />
        <Route path="/admin/:rest*" component={Admin} />
      </Router>
    );
  }

  return (
    <Shell>
      <Router>
        <Route path="/" component={Home} />
        <Route path="/condition/:condition" component={ConditionList} />
        <Route path="/all" component={AllRestaurants} />
        <Route path="/neighborhoods" component={NeighborhoodMap} />
        <Route path="/neighborhoods/:region" component={NeighborhoodList} />
        <Route path="/restaurant/:id" component={RestaurantDetail} />
        <Route path="/about" component={About} />
        <Route default component={NotFound} />
      </Router>
    </Shell>
  );
}

export function App() {
  return (
    <LocationProvider>
      <AppRoutes />
    </LocationProvider>
  );
}
