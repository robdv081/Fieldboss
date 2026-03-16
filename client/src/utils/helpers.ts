// FieldBoss — Utility helpers

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatTime(timeStr: string): string {
  if (!timeStr) return '—';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function statusColor(status: string): string {
  switch (status) {
    case 'completed':
    case 'paid':
    case 'accepted':
      return 'badge-success';
    case 'in_progress':
    case 'sent':
      return 'badge-info';
    case 'scheduled':
      return 'badge-primary';
    case 'pending':
    case 'draft':
      return 'badge-warning';
    case 'cancelled':
    case 'declined':
    case 'overdue':
      return 'badge-error';
    default:
      return 'badge-ghost';
  }
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export function parseLineItems(json: string): Array<{ description: string; qty: number; rate: number; total: number }> {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export function parseCrewIds(json: string): number[] {
  try {
    return JSON.parse(json);
  } catch {
    return [];
  }
}

export const TRADES = [
  'Car Detailing', 'Plumbing', 'Electrical', 'HVAC', 'Landscaping', 'Roofing',
  'Painting', 'Carpentry', 'Concrete', 'Flooring', 'Cleaning',
  'General Contracting', 'Fencing', 'Pressure Washing', 'Drywall', 'Other'
];

export const SOURCES = [
  'Referral', 'Google', 'Facebook', 'Yelp', 'Nextdoor',
  'Angi', 'HomeAdvisor', 'Thumbtack', 'Walk-in', 'Repeat', 'Other'
];

export const PLATFORMS = [
  'Google', 'Yelp', 'Facebook', 'Nextdoor', 'Angi', 'HomeAdvisor', 'Thumbtack', 'BBB', 'Other'
];
