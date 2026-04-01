import { useState, useEffect } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { Logo } from '../ui/Logo';

function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()} ${date.getFullYear()}`;
}

function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

const CONDITION_TITLES: Record<string, string> = {
  foggy: 'Cozy Foods Forecast',
  sunny: 'Sunny Weather Foods Forecast',
  night: 'Late Night Forecast',
};

export function Header() {
  const [now, setNow] = useState(new Date());
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [displayTitle, setDisplayTitle] = useState('');
  const [typing, setTyping] = useState(false);
  const { path } = useLocation();

  const conditionMatch = path.match(/\/condition\/(\w+)/);
  const restaurantMatch = path.match(/\/restaurant\/(\d+)/);

  useEffect(() => {
    if (restaurantMatch) {
      fetch(`/api/restaurants/${restaurantMatch[1]}`)
        .then(r => r.json())
        .then(data => setRestaurantName(data.name || null))
        .catch(() => setRestaurantName(null));
    } else {
      setRestaurantName(null);
    }
  }, [path]);

  let title = 'San Francisco Dining Conditions';
  if (path === '/about') {
    title = 'About';
  } else if (restaurantName) {
    title = restaurantName;
  } else if (conditionMatch) {
    title = CONDITION_TITLES[conditionMatch[1]] || title;
  }

  useEffect(() => {
    setTyping(true);
    setDisplayTitle('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayTitle(title.slice(0, i));
      if (i >= title.length) {
        clearInterval(id);
        setTyping(false);
      }
    }, 35);
    return () => clearInterval(id);
  }, [title]);

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header class="ws4000-header">
      <Logo />
      <h1 class="ws4000-header__title">
        {displayTitle}
        {typing && <span class="ws4000-header__cursor">|</span>}
      </h1>
      <div class="ws4000-header__datetime">
        <span class="ws4000-header__date">{formatDate(now)}</span>
        <span class="ws4000-header__time">{formatTime(now)}</span>
      </div>
    </header>
  );
}
