import { render } from 'preact';
import { App } from './app';
import './styles/main.scss';

render(<App />, document.getElementById('app')!);

// Set --vh-scale for mobile landscape: ratio of viewport height to 960px (desktop height)
function updateVhScale() {
  document.documentElement.style.setProperty('--vh-scale', String(window.innerHeight / 960));
}
updateVhScale();
window.addEventListener('resize', updateVhScale);

// Ctrl+Shift+C to toggle CSS CRT effects
document.addEventListener('keydown', (e) => {
  if (e.key === 'C' && e.ctrlKey && e.shiftKey) {
    const scanlines = document.querySelector('.scanlines') as HTMLElement;
    if (scanlines) {
      scanlines.style.display = scanlines.style.display === 'none' ? 'block' : 'none';
    }
  }
});

