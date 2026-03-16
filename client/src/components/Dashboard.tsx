import React, { useEffect, useState } from 'react';
import { CalendarDays, DollarSign, FileText, Star, TrendingUp, Clock, HardHat } from 'lucide-react';
import type { Job, DashboardStats } from '../types';
import { formatCurrency, formatTime, statusColor, statusLabel } from '../utils/helpers';
import { getDashboard } from '../api';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (page: 'jobs' | 'customers' | 'estimates' | 'invoices' | 'crew' | 'reviews') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const data = await getDashboard();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        <span>{error}</span>
      </div>
    );
  }

  if (!stats) return null;

  const todayJobsList: Job[] = stats.recentJobs || [];

  const statCards = [
    { label: "Today's Jobs", value: stats.todayJobs, icon: <CalendarDays size={22} />, color: 'text-primary', click: () => onNavigate('jobs') },
    { label: 'This Week', value: stats.weekJobs, icon: <Clock size={22} />, color: 'text-info', click: () => onNavigate('jobs') },
    { label: 'Pending Estimates', value: stats.pendingEstimates, icon: <FileText size={22} />, color: 'text-warning', click: () => onNavigate('estimates') },
    { label: 'Unpaid Invoices', value: stats.unpaidInvoices, icon: <DollarSign size={22} />, color: 'text-error', click: () => onNavigate('invoices') },
    { label: 'Month Revenue', value: formatCurrency(stats.monthRevenue), icon: <TrendingUp size={22} />, color: 'text-success', click: () => onNavigate('invoices') },
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: <DollarSign size={22} />, color: 'text-success', click: () => onNavigate('invoices') },
    { label: 'Avg Rating', value: stats.totalReviews > 0 ? `${stats.avgRating} ★` : '—', icon: <Star size={22} />, color: 'text-secondary', click: () => onNavigate('reviews') },
    { label: 'Active Crew', value: stats.activeCrew, icon: <HardHat size={22} />, color: 'text-accent', click: () => onNavigate('crew') },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-xl font-bold">Welcome back{user?.businessName ? `, ${user.businessName}` : ''}! 👋</h2>
        <p className="text-sm text-base-content/50">Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
          <div
            key={i}
            className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors"
            onClick={s.click}
          >
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <span className={`${s.color} opacity-80`}>{s.icon}</span>
              </div>
              <div className="text-2xl font-bold mt-1">{s.value}</div>
              <div className="text-xs text-base-content/50">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Schedule */}
      <div className="card bg-base-200">
        <div className="card-body p-4">
          <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
            <CalendarDays size={16} className="text-primary" /> Today's Schedule
          </h3>
          {todayJobsList.length === 0 ? (
            <p className="text-base-content/50 text-sm">No jobs scheduled for today.</p>
          ) : (
            <div className="space-y-2">
              {todayJobsList.map((job) => (
                <div key={job.id} className="flex items-center gap-3 p-2 rounded-lg bg-base-100">
                  <div className="text-sm font-mono text-primary w-16 shrink-0">{formatTime(job.scheduled_time)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{job.title}</div>
                    <div className="text-xs text-base-content/50 truncate">{job.customer_name || 'No customer'} • {job.address || 'No address'}</div>
                  </div>
                  <span className={`badge badge-sm ${statusColor(job.status)}`}>{statusLabel(job.status)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
