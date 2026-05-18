import { STATUS_CONFIG } from '../../data/mockData';

interface Props {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#64748b', bg: '#f1f5f9', icon: 'bi-circle' };
  const fontSize = size === 'sm' ? '10.5px' : '11.5px';
  const padding  = size === 'sm' ? '2px 7px' : '3px 9px';

  return (
    <span
      className="status-badge"
      style={{ background: cfg.bg, color: cfg.color, fontSize, padding }}
    >
      <i className={`bi ${cfg.icon}`} style={{ fontSize: size === 'sm' ? 9 : 10 }} />
      {cfg.label}
    </span>
  );
}
