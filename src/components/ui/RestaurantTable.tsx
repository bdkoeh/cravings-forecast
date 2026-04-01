import { useState } from 'preact/hooks';
import { useLocation } from 'preact-iso';
import { ConditionIcon } from './ConditionIcon';
import pickStar from '../../assets/images/icons/pick-star.png';

interface Restaurant {
  id: number;
  name: string;
  link: string | null;
  neighborhood: string;
  cuisine_type: string | null;
  conditions: string[];
  highlighted?: number;
}

interface RestaurantTableProps {
  restaurants: Restaurant[];
  showConditionIcons?: boolean;
}

type SortKey = 'pick' | 'name' | 'neighborhood' | 'cuisine';
type SortDir = 'asc' | 'desc';

function sortRestaurants(restaurants: Restaurant[], key: SortKey, dir: SortDir): Restaurant[] {
  const sorted = [...restaurants].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (key) {
      case 'pick':
        aVal = a.highlighted ?? 0;
        bVal = b.highlighted ?? 0;
        return dir === 'asc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number);
      case 'name':
        aVal = a.name.toLowerCase();
        bVal = b.name.toLowerCase();
        break;
      case 'neighborhood':
        aVal = a.neighborhood.toLowerCase();
        bVal = b.neighborhood.toLowerCase();
        break;
      case 'cuisine':
        aVal = (a.cuisine_type ?? '').toLowerCase();
        bVal = (b.cuisine_type ?? '').toLowerCase();
        break;
    }

    if (aVal < bVal) return dir === 'asc' ? -1 : 1;
    if (aVal > bVal) return dir === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

export function RestaurantTable({ restaurants, showConditionIcons = false }: RestaurantTableProps) {
  const { route } = useLocation();
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  if (restaurants.length === 0) {
    return <p class="ws4000-table__empty">No restaurants found</p>;
  }

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const sorted = sortRestaurants(restaurants, sortKey, sortDir);
  const arrow = sortDir === 'asc' ? ' ▲' : ' ▼';

  return (
    <div class="ws4000-table-wrapper">
    <table class="ws4000-table">
      <thead>
        <tr>
          <th class="ws4000-table__sortable ws4000-table__pick-col" onClick={() => handleSort('pick')}>Pick{sortKey === 'pick' ? arrow : ''}</th>
          {showConditionIcons && <th>Conditions</th>}
          <th class="ws4000-table__sortable ws4000-table__name-col" onClick={() => handleSort('name')}>Name{sortKey === 'name' ? arrow : ''}</th>
          <th class="ws4000-table__sortable ws4000-table__hood-col" onClick={() => handleSort('neighborhood')}>Hood{sortKey === 'neighborhood' ? arrow : ''}</th>
          <th class="ws4000-table__sortable ws4000-table__cuisine-col" onClick={() => handleSort('cuisine')}>Cuisine{sortKey === 'cuisine' ? arrow : ''}</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((r) => (
          <tr
            key={r.id}
            class="ws4000-table__row--clickable"
            onClick={() => route(`/restaurant/${r.id}`)}
          >
            {showConditionIcons && (
              <td>
                {r.conditions.map((c) => (
                  <ConditionIcon key={c} condition={c} size="small" />
                ))}
              </td>
            )}
            <td>{r.highlighted ? <img src={pickStar} alt="Pick" class="ws4000-table__pick-icon" /> : null}</td>
            <td class={r.highlighted ? 'ws4000-table__pick' : undefined}>
              {r.name}
              {r.cuisine_type && (
                <span class="ws4000-table__cuisine-secondary">{r.cuisine_type}</span>
              )}
            </td>
            <td>{r.neighborhood}</td>
            <td>{r.cuisine_type ?? ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
