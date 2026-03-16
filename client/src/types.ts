// FieldBoss — Shared types

export type JobStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type EstimateStatus = 'draft' | 'sent' | 'accepted' | 'declined';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type CrewStatus = 'active' | 'inactive';

export interface User {
  id: number;
  email: string;
  businessName: string;
  trade: string;
}

export interface Job {
  id: number;
  customer_id: number | null;
  customer_name: string;
  title: string;
  description: string;
  trade: string;
  status: JobStatus;
  scheduled_date: string;
  scheduled_time: string;
  estimated_duration: number;
  address: string;
  assigned_crew: string; // JSON array of crew ids
  estimated_cost: number;
  actual_cost: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface Estimate {
  id: number;
  customer_id: number | null;
  customer_name: string;
  job_id: number | null;
  title: string;
  items: string; // JSON
  subtotal: number;
  tax_rate: number;
  tax: number;
  total: number;
  status: EstimateStatus;
  notes: string;
  created_at: string;
  valid_until: string;
}

export interface Invoice {
  id: number;
  customer_id: number | null;
  customer_name: string;
  job_id: number | null;
  estimate_id: number | null;
  title: string;
  items: string; // JSON
  subtotal: number;
  tax_rate: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  due_date: string;
  paid_date: string;
  notes: string;
  created_at: string;
}

export interface CrewMember {
  id: number;
  name: string;
  phone: string;
  email: string;
  role: string;
  trade: string;
  hourly_rate: number;
  status: CrewStatus;
  notes: string;
  created_at: string;
}

export interface Review {
  id: number;
  customer_id: number | null;
  customer_name: string;
  job_id: number | null;
  rating: number;
  review_text: string;
  platform: string;
  review_date: string;
  responded: number;
  response_text: string;
}

export interface LineItem {
  description: string;
  qty: number;
  rate: number;
  total: number;
}

export type Page = 'dashboard' | 'jobs' | 'customers' | 'estimates' | 'invoices' | 'crew' | 'reviews';

export interface DashboardStats {
  todayJobs: number;
  weekJobs: number;
  pendingEstimates: number;
  unpaidInvoices: number;
  totalRevenue: number;
  monthRevenue: number;
  avgRating: number;
  totalReviews: number;
  activeCrew: number;
  recentJobs?: Job[];
  counts?: {
    jobs: number;
    customers: number;
    estimates: number;
    invoices: number;
    crew: number;
    reviews: number;
  };
}
