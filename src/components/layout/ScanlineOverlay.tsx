interface ScanlineOverlayProps {
  enabled?: boolean;
}

export function ScanlineOverlay({ enabled = true }: ScanlineOverlayProps) {
  if (!enabled) return null;
  return <div class="scanlines" aria-hidden="true" />;
}
