import {
  formatDistanceToNowStrict,
  format,
  isToday,
  isYesterday,
  differenceInHours,
} from 'date-fns';

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const hoursAgo = differenceInHours(new Date(), date);

  if (hoursAgo < 24) {
    return formatDistanceToNowStrict(date, { addSuffix: true });
  }

  if (isToday(date)) {
    return 'Today';
  }

  if (isYesterday(date)) {
    return 'Yesterday';
  }

  const now = new Date();
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMM d');
  }

  return format(date, 'MMM d, yyyy');
}

export function formatFullDate(timestamp: number): string {
  return format(new Date(timestamp), 'MMMM d, yyyy h:mm a');
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatContactName(contact: {
  first_name: string;
  last_name: string | null;
}): string {
  return contact.last_name
    ? `${contact.first_name} ${contact.last_name}`
    : contact.first_name;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}
