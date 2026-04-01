import { useLocation } from 'preact-iso';
import { usePageTitle } from '../hooks/usePageMeta';

export function NotFound() {
  const { route } = useLocation();

  usePageTitle('Signal Lost');

  return (
    <div class="screen bg-hazard">
      <div class="signal-lost">
        <div class="signal-lost__static" />
        <h1 class="signal-lost__title">NO SIGNAL</h1>
        <p class="signal-lost__message">
          This channel is not currently broadcasting.<br />
          Please stand by or return to regular programming.
        </p>
        <button class="signal-lost__button" onClick={() => route('/')} type="button">
          Return to Forecast
        </button>
      </div>
    </div>
  );
}
