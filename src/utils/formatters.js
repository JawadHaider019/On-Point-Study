/**
 * Format numbers as GBP currency (£12,000)
 */
export function formatGBP(amount) {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '£0';
  }
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Get status color classes for Tailwind styling
 */
export function getStatusStyle(status) {
  switch (status) {
    case 'In Progress':
      return {
        badge: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
        dot: 'bg-slate-500',
        text: 'text-slate-800',
        bg: 'bg-slate-50',
      };
    case 'Ready to Claim':
      return {
        badge: 'bg-blue-50 text-blue-800 border-blue-300 font-bold',
        dot: 'bg-blue-600',
        text: 'text-blue-800',
        bg: 'bg-blue-50/60',
      };
    case 'Under Review':
      return {
        badge: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
        dot: 'bg-amber-600',
        text: 'text-amber-900',
        bg: 'bg-amber-50/60',
      };
    case 'Ready for Payment':
      return {
        badge: 'bg-indigo-50 text-indigo-800 border-indigo-300 font-bold',
        dot: 'bg-indigo-600',
        text: 'text-indigo-800',
        bg: 'bg-indigo-50/60',
      };
    case 'Paid':
      return {
        badge: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black',
        dot: 'bg-emerald-600',
        text: 'text-emerald-900',
        bg: 'bg-emerald-50/60',
      };
    case 'Withdrawn':
      return {
        badge: 'bg-rose-50 text-rose-800 border-rose-300 font-semibold',
        dot: 'bg-rose-600',
        text: 'text-rose-800',
        bg: 'bg-rose-50/60',
      };
    case 'Not Eligible':
      return {
        badge: 'bg-zinc-100 text-zinc-700 border-zinc-300 font-medium',
        dot: 'bg-zinc-400',
        text: 'text-zinc-700',
        bg: 'bg-zinc-100/60',
      };
    case 'Clawback Requested':
      return {
        badge: 'bg-orange-50 text-orange-900 border-orange-300 font-extrabold',
        dot: 'bg-orange-600',
        text: 'text-orange-900',
        bg: 'bg-orange-50/60',
      };
    default:
      return {
        badge: 'bg-slate-100 text-slate-800 border-slate-300 font-medium',
        dot: 'bg-slate-500',
        text: 'text-slate-800',
        bg: 'bg-slate-50',
      };
  }
}

/**
 * Format string dates for user display
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format relative time string e.g. "2 hours ago"
 */
export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(dateString);
}
