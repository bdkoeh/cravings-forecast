import { useState, useEffect, useRef } from 'preact/hooks';
import { useLocation } from 'preact-iso';

export function CrawlBar() {
  const { route } = useLocation();
  const [messages, setMessages] = useState<string[]>([]);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/crawl-messages')
      .then(r => r.json())
      .then((data: Array<{ id: number; message: string }>) => {
        setMessages(data.map(d => d.message));
      })
      .catch(() => {
        setMessages(['Welcome to SF Cravings Forecast']);
      });
  }, []);

  // Build scroll text: join messages with separator, duplicate for seamless loop
  const separator = '   \u2022\u2022\u2022   '; // bullet separator (evokes ticker style)
  const scrollText = messages.length > 0
    ? messages.join(separator)
    : 'Welcome to SF Cravings Forecast';

  // Calculate animation duration based on text length (0.15s per char, min 15s)
  const duration = Math.max(15, scrollText.length * 0.15);

  return (
    <footer class="crawl-bar">
      <button class="crawl-bar__header" onClick={() => route('/about')} type="button">About SF Cravings Channel</button>
      <div class="crawl-bar__track">
        <div
          class="crawl-bar__text"
          ref={textRef}
          style={{ animationDuration: `${duration}s` }}
        >
          <span>{scrollText}</span>
          <span class="crawl-bar__text-duplicate">{separator}{scrollText}</span>
        </div>
      </div>
    </footer>
  );
}
