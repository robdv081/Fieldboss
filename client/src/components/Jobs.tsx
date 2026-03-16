import React, { useEffect, useState } from 'react';
import { Plus, Search, CalendarDays, MapPin, Clock, X, Save, Trash2 } from 'lucide-react';
import type { Job, Customer, CrewMember, JobStatus } from '../types';
import { formatCurrency, formatDate, formatTime, statusColor, statusLabel, todayStr, TRADES } from '../utils/helpers';
import * as api from '../api';

export const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [jRows, cRows, crRows] = await Promise.all([
        api.getJobs(),
        api.getCustomers(),
        api.getCrew(),
      ]);
      setJobs(jRows);
      setCustomers(cRows);
      setCrew(crRows.filter(c => c.status === 'active'));
    } catch (err) { console.error('Failed to load jobs:', err); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditingJob({ title: '', description: '', trade: '', status: 'pending', scheduled_date: todayStr(), scheduled_time: '09:00', estimated_duration: 1, address: '', assigned_crew: '[]', estimated_cost: 0, actual_cost: 0, notes: '', customer_id: null });
    setShowModal(true);
  }

  function openEdit(job: Job) {
    setEditingJob({ ...job });
    setShowModal(true);
  }

  async function saveJob() {
    if (!editingJob || !editingJob.title) return;
    setSaving(true);
    try {
      if (editingJob.id) {
        await api.updateJob(editingJob.id, editingJob);
      } else {
        await api.createJob(editingJob);
      }
      setShowModal(false);
      setEditingJob(null);
      loadData();
    } catch (err) { console.error('Failed to save job:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteJob(id);
      setJobs(prev => prev.filter(j => j.id !== id));
    } catch (err) { console.error('Failed to delete job:', err); }
  }

  async function quickStatus(id: number, status: JobStatus) {
    try {
      await api.updateJobStatus(id, status);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j));
    } catch (err) { console.error('Failed to update status:', err); }
  }

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || (j.customer_name || '').toLowerCase().includes(search.toLowerCase()) || j.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="Search jobs..." value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <select className="select select-bordered select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> New Job</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          <CalendarDays size={48} className="mx-auto mb-3 opacity-30" />
          <p>No jobs found. Create your first job to get started!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(job => (
            <div key={job.id} className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => openEdit(job)}>
              <div className="card-body p-4 flex-row items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{job.title}</span>
                    {job.trade && <span className="badge badge-ghost badge-xs">{job.trade}</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-base-content/50 mt-1 flex-wrap">
                    {job.customer_name && <span className="flex items-center gap-1"><Users2Icon /> {job.customer_name}</span>}
                    {job.scheduled_date && <span className="flex items-center gap-1"><CalendarDays size={12} /> {formatDate(job.scheduled_date)}</span>}
                    {job.scheduled_time && <span className="flex items-center gap-1"><Clock size={12} /> {formatTime(job.scheduled_time)}</span>}
                    {job.address && <span className="flex items-center gap-1"><MapPin size={12} /> {job.address}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {job.estimated_cost > 0 && <span className="text-sm font-mono text-success hidden sm:inline">{formatCurrency(job.estimated_cost)}</span>}
                  <span className={`badge badge-sm ${statusColor(job.status)}`}>{statusLabel(job.status)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editingJob && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editingJob.id ? 'Edit Job' : 'New Job'}</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Job Title *</span></label>
                <input className="input input-bordered input-sm" value={editingJob.title || ''} onChange={e => setEditingJob({ ...editingJob, title: e.target.value })} placeholder="e.g. Kitchen remodel" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Customer</span></label>
                <select className="select select-bordered select-sm" value={editingJob.customer_id ?? ''} onChange={e => setEditingJob({ ...editingJob, customer_id: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">No customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Trade</span></label>
                <select className="select select-bordered select-sm" value={editingJob.trade || ''} onChange={e => setEditingJob({ ...editingJob, trade: e.target.value })}>
                  <option value="">Select trade</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Status</span></label>
                <select className="select select-bordered select-sm" value={editingJob.status || 'pending'} onChange={e => setEditingJob({ ...editingJob, status: e.target.value as JobStatus })}>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Scheduled Date</span></label>
                <input type="date" className="input input-bordered input-sm" value={editingJob.scheduled_date || ''} onChange={e => setEditingJob({ ...editingJob, scheduled_date: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Scheduled Time</span></label>
                <input type="time" className="input input-bordered input-sm" value={editingJob.scheduled_time || ''} onChange={e => setEditingJob({ ...editingJob, scheduled_time: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Duration (hours)</span></label>
                <input type="number" className="input input-bordered input-sm" value={editingJob.estimated_duration || 1} onChange={e => setEditingJob({ ...editingJob, estimated_duration: Number(e.target.value) })} min={0.5} step={0.5} />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Address</span></label>
                <input className="input input-bordered input-sm" value={editingJob.address || ''} onChange={e => setEditingJob({ ...editingJob, address: e.target.value })} placeholder="Job site address" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Estimated Cost</span></label>
                <input type="number" className="input input-bordered input-sm" value={editingJob.estimated_cost || 0} onChange={e => setEditingJob({ ...editingJob, estimated_cost: Number(e.target.value) })} min={0} step={0.01} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Actual Cost</span></label>
                <input type="number" className="input input-bordered input-sm" value={editingJob.actual_cost || 0} onChange={e => setEditingJob({ ...editingJob, actual_cost: Number(e.target.value) })} min={0} step={0.01} />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Description</span></label>
                <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={editingJob.description || ''} onChange={e => setEditingJob({ ...editingJob, description: e.target.value })} placeholder="Job details..." />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Notes</span></label>
                <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={editingJob.notes || ''} onChange={e => setEditingJob({ ...editingJob, notes: e.target.value })} placeholder="Internal notes..." />
              </div>
            </div>
            <div className="modal-action">
              {editingJob.id && <button className="btn btn-error btn-sm btn-outline mr-auto" onClick={() => { handleDelete(editingJob.id!); setShowModal(false); }}><Trash2 size={14} /> Delete</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn btn-primary btn-sm ${saving ? 'loading' : ''}`} onClick={saveJob} disabled={saving}><Save size={14} /> Save</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};

// Small helper icon component
function Users2Icon() {
  return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
}
