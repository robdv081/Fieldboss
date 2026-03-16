import axios from 'axios';
import type { User, Job, Customer, Estimate, Invoice, CrewMember, Review, DashboardStats, JobStatus } from './types';

const TOKEN_KEY = 'fieldboss_token';
const USER_KEY = 'fieldboss_user';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor: attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ---- Token / User helpers ----

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function storeAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// ---- Auth ----

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
}

export async function register(
  email: string,
  password: string,
  businessName: string,
  trade: string
): Promise<{ token: string; user: User }> {
  const { data } = await api.post('/auth/register', { email, password, businessName, trade });
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await api.get('/auth/me');
  return data;
}

// ---- Dashboard ----

export async function getDashboard(): Promise<DashboardStats> {
  const { data } = await api.get('/dashboard');
  return data;
}

// ---- Customers ----

export async function getCustomers(search?: string): Promise<Customer[]> {
  const { data } = await api.get('/customers', { params: { search } });
  return data;
}

export async function createCustomer(customer: Partial<Customer>): Promise<Customer> {
  const { data } = await api.post('/customers', customer);
  return data;
}

export async function updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
  const { data } = await api.put(`/customers/${id}`, customer);
  return data;
}

export async function deleteCustomer(id: number): Promise<void> {
  await api.delete(`/customers/${id}`);
}

// ---- Jobs ----

export async function getJobs(search?: string, status?: string): Promise<Job[]> {
  const { data } = await api.get('/jobs', { params: { search, status } });
  return data;
}

export async function createJob(job: Partial<Job>): Promise<Job> {
  const { data } = await api.post('/jobs', job);
  return data;
}

export async function updateJob(id: number, job: Partial<Job>): Promise<Job> {
  const { data } = await api.put(`/jobs/${id}`, job);
  return data;
}

export async function deleteJob(id: number): Promise<void> {
  await api.delete(`/jobs/${id}`);
}

export async function updateJobStatus(id: number, status: JobStatus): Promise<Job> {
  const { data } = await api.patch(`/jobs/${id}/status`, { status });
  return data;
}

// ---- Estimates ----

export async function getEstimates(search?: string, status?: string): Promise<Estimate[]> {
  const { data } = await api.get('/estimates', { params: { search, status } });
  return data;
}

export async function createEstimate(estimate: Partial<Estimate>): Promise<Estimate> {
  const { data } = await api.post('/estimates', estimate);
  return data;
}

export async function updateEstimate(id: number, estimate: Partial<Estimate>): Promise<Estimate> {
  const { data } = await api.put(`/estimates/${id}`, estimate);
  return data;
}

export async function deleteEstimate(id: number): Promise<void> {
  await api.delete(`/estimates/${id}`);
}

// ---- Invoices ----

export async function getInvoices(search?: string, status?: string): Promise<Invoice[]> {
  const { data } = await api.get('/invoices', { params: { search, status } });
  return data;
}

export async function createInvoice(invoice: Partial<Invoice>): Promise<Invoice> {
  const { data } = await api.post('/invoices', invoice);
  return data;
}

export async function updateInvoice(id: number, invoice: Partial<Invoice>): Promise<Invoice> {
  const { data } = await api.put(`/invoices/${id}`, invoice);
  return data;
}

export async function deleteInvoice(id: number): Promise<void> {
  await api.delete(`/invoices/${id}`);
}

// ---- Crew ----

export async function getCrew(search?: string): Promise<CrewMember[]> {
  const { data } = await api.get('/crew', { params: { search } });
  return data;
}

export async function createCrewMember(member: Partial<CrewMember>): Promise<CrewMember> {
  const { data } = await api.post('/crew', member);
  return data;
}

export async function updateCrewMember(id: number, member: Partial<CrewMember>): Promise<CrewMember> {
  const { data } = await api.put(`/crew/${id}`, member);
  return data;
}

export async function deleteCrewMember(id: number): Promise<void> {
  await api.delete(`/crew/${id}`);
}

// ---- Reviews ----

export async function getReviews(search?: string): Promise<Review[]> {
  const { data } = await api.get('/reviews', { params: { search } });
  return data;
}

export async function createReview(review: Partial<Review>): Promise<Review> {
  const { data } = await api.post('/reviews', review);
  return data;
}

export async function updateReview(id: number, review: Partial<Review>): Promise<Review> {
  const { data } = await api.put(`/reviews/${id}`, review);
  return data;
}

export async function deleteReview(id: number): Promise<void> {
  await api.delete(`/reviews/${id}`);
}
