import { useLocation } from 'preact-iso';
import logoSrc from '../../assets/images/sf-cravings-channel-logo.png';

export function Logo() {
  const { route } = useLocation();

  return (
    <div class="ws4000-logo" onClick={() => route('/')} style="cursor: pointer;">
      <img src={logoSrc} alt="SF Cravings Channel" class="ws4000-logo__img" />
    </div>
  );
}
