import { useLocation } from 'preact-iso';
import { usePageTitle, useMetaDescription, useCanonical } from '../hooks/usePageMeta';

export interface Region {
  id: string;
  name: string;
  neighborhoods: string[];
}

export const REGIONS: Region[] = [
  { id: 'richmond', name: 'The Avenues West', neighborhoods: ['Richmond', 'Inner Richmond', 'Outer Richmond'] },
  { id: 'sunset', name: 'The Avenues South', neighborhoods: ['Sunset', 'Inner Sunset', 'Outer Sunset'] },
  { id: 'downtown', name: 'Downtown & Hills', neighborhoods: ['Financial District', 'SoMa', 'Nob Hill', 'Chinatown', 'Tenderloin'] },
  { id: 'north-waterfront', name: 'North Waterfront', neighborhoods: ['Marina', 'North Beach', 'Pacific Heights', 'Japantown'] },
  { id: 'central', name: 'Central', neighborhoods: ['Haight', 'Hayes Valley', 'Western Addition', 'Castro', 'Noe Valley'] },
  { id: 'south-central', name: 'Southern Slopes', neighborhoods: ['Mission', 'Bernal Heights', 'Potrero Hill', 'Dogpatch'] },
  { id: 'far-south', name: 'Far South', neighborhoods: ['Excelsior', 'Bayview'] },
];

interface MapRegionProps {
  region: Region;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}

function MapRegion({ region, x, y, width, height, onClick }: MapRegionProps) {
  return (
    <g
      class="map-region"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      <title>{region.name}</title>
      <rect x={x} y={y} width={width} height={height} rx={4} fill="#8080FF" />
      <text x={x + width / 2} y={y + height / 2}>{region.name}</text>
    </g>
  );
}

const REGION_POSITIONS: Record<string, { x: number; y: number; w: number; h: number }> = {
  richmond:          { x: 40,  y: 60,  w: 180, h: 140 },
  sunset:            { x: 40,  y: 210, w: 180, h: 180 },
  'north-waterfront': { x: 230, y: 60,  w: 200, h: 100 },
  downtown:          { x: 350, y: 170, w: 180, h: 140 },
  central:           { x: 230, y: 170, w: 110, h: 170 },
  'south-central':   { x: 350, y: 320, w: 180, h: 100 },
  'far-south':       { x: 280, y: 400, w: 250, h: 60  },
};

export function NeighborhoodMap() {
  const { route } = useLocation();
  usePageTitle('SF Neighborhoods');
  useMetaDescription('Explore San Francisco restaurants by neighborhood. Browse curated dining picks across the Mission, Richmond, Sunset, Downtown, and more.');
  useCanonical('/neighborhoods');

  return (
    <div class="screen bg-cascading">
      <h1 class="screen-title">SF Neighborhoods</h1>
      <div class="neighborhood-map-container">
        <svg
          viewBox="0 0 640 480"
          class="neighborhood-map"
          shape-rendering="crispEdges"
          role="img"
          aria-label="Map of San Francisco neighborhoods"
        >
          {/* Water/background */}
          <rect x="0" y="0" width="640" height="480" fill="#102080" />

          {/* Render each region as a clickable rect group */}
          {REGIONS.map((region) => {
            const pos = REGION_POSITIONS[region.id];
            return (
              <MapRegion
                key={region.id}
                region={region}
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                onClick={() => route(`/neighborhoods/${region.id}`)}
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
