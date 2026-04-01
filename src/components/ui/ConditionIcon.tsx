import fogIcon from '../../assets/images/icons/Fog.gif';
import nightIcon from '../../assets/images/icons/Night.gif';
import sunnyIcon from '../../assets/images/icons/Sunny.gif';

const ICON_MAP: Record<string, string> = {
  foggy: fogIcon,
  night: nightIcon,
  sunny: sunnyIcon,
};

const ALT_MAP: Record<string, string> = {
  foggy: 'Foggy weather condition icon',
  night: 'Late night condition icon',
  sunny: 'Sunny weather condition icon',
};

interface ConditionIconProps {
  condition: string;
  size?: 'small' | 'large';
}

export function ConditionIcon({ condition, size = 'small' }: ConditionIconProps) {
  const src = ICON_MAP[condition.toLowerCase()];
  if (!src) return null;

  return (
    <img
      class={`condition-icon condition-icon--${size}`}
      src={src}
      alt={ALT_MAP[condition.toLowerCase()] || condition}
    />
  );
}
