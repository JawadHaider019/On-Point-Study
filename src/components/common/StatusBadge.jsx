import React from 'react';
import { getStatusStyle } from '../../utils/formatters';

export const StatusBadge = ({
  status,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const style = getStatusStyle(status);

  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      id={`status-badge-${status.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide whitespace-nowrap transition-colors ${style.badge} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0 animate-pulse`}
          aria-hidden="true"
        />
      )}
      <span>{status}</span>
    </span>
  );
};
