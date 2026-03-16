import React, { useEffect, useState } from 'react';
import { Plus, Search, Star, X, Save, Trash2, MessageSquare } from 'lucide-react';
import type { Review, Customer } from '../types';
import { formatDate, PLATFORMS } from '../utils/helpers';
import * as api from '../api';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Review> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [rRows, cRows] = await Promise.all([
        api.getReviews(),
        api.getCustomers(),
      ]);
      setReviews(rRows);
      setCustomers(cRows);
    } catch (err) { console.error('Failed to load reviews:', err); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditing({ customer_id: null, rating: 5, review_text: '', platform: 'Google', review_date: new Date().toISOString().split('T')[0], responded: 0, response_text: '' });
    setShowModal(true);
  }

  function openEdit(r: Review) {
    setEditing({ ...r });
    setShowModal(true);
  }

  async function saveReview() {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.id) {
        await api.updateReview(editing.id, editing);
      } else {
        await api.createReview(editing);
      }
      setShowModal(false);
      loadData();
    } catch (err) { console.error('Failed to save review:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) { console.error('Failed to delete review:', err); }
  }

  const filtered = reviews.filter(r => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (r.customer_name || '').toLowerCase().includes(s) || r.review_text.toLowerCase().includes(s) || r.platform.toLowerCase().includes(s);
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const responded = reviews.filter(r => r.responded).length;

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} size={14} className={i <= rating ? 'text-warning fill-warning' : 'text-base-content/20'} />
        ))}
      </div>
    );
  }

  if (loading) return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2 flex-wrap">
        <div className="card bg-base-200 px-4 py-2">
          <div className="text-2xl font-bold text-warning">{avgRating} <Star size={18} className="inline text-warning fill-warning mb-1" /></div>
          <div className="text-xs text-base-content/50">{reviews.length} reviews</div>
        </div>
        <div className="card bg-base-200 px-4 py-2">
          <div className="text-2xl font-bold text-success">{responded}</div>
          <div className="text-xs text-base-content/50">responded</div>
        </div>
        <div className="card bg-base-200 px-4 py-2">
          <div className="text-2xl font-bold text-error">{reviews.length - responded}</div>
          <div className="text-xs text-base-content/50">needs response</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> Add Review</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          <Star size={48} className="mx-auto mb-3 opacity-30" />
          <p>No reviews yet. Add your first review!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(r => (
            <div key={r.id} className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => openEdit(r)}>
              <div className="card-body p-4">
                <div className="flex items-start justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    {renderStars(r.rating)}
                    <span className="badge badge-ghost badge-xs">{r.platform}</span>
                    {r.responded ? <span className="badge badge-success badge-xs gap-1"><MessageSquare size={10} /> Responded</span> : <span className="badge badge-error badge-xs">Needs Response</span>}
                  </div>
                  <span className="text-xs text-base-content/50">{formatDate(r.review_date)}</span>
                </div>
                <p className="text-sm mt-1 line-clamp-2">{r.review_text || <span className="text-base-content/30 italic">No review text</span>}</p>
                <div className="text-xs text-base-content/50 mt-1">{r.customer_name || 'Anonymous'}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editing && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing.id ? 'Edit Review' : 'Add Review'}</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Rating</span></label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button key={i} className="btn btn-ghost btn-sm btn-circle" onClick={() => setEditing({ ...editing, rating: i })}>
                      <Star size={20} className={i <= (editing.rating || 5) ? 'text-warning fill-warning' : 'text-base-content/20'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Platform</span></label>
                  <select className="select select-bordered select-sm" value={editing.platform || ''} onChange={e => setEditing({ ...editing, platform: e.target.value })}>
                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Customer</span></label>
                  <select className="select select-bordered select-sm" value={editing.customer_id ?? ''} onChange={e => setEditing({ ...editing, customer_id: e.target.value ? Number(e.target.value) : null })}>
                    <option value="">Anonymous</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Date</span></label>
                <input type="date" className="input input-bordered input-sm" value={editing.review_date || ''} onChange={e => setEditing({ ...editing, review_date: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Review Text</span></label>
                <textarea className="textarea textarea-bordered textarea-sm" rows={3} value={editing.review_text || ''} onChange={e => setEditing({ ...editing, review_text: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-2">
                  <input type="checkbox" className="checkbox checkbox-sm checkbox-success" checked={!!editing.responded} onChange={e => setEditing({ ...editing, responded: e.target.checked ? 1 : 0 })} />
                  <span className="label-text text-xs">Responded</span>
                </label>
              </div>
              {editing.responded ? (
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Response</span></label>
                  <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={editing.response_text || ''} onChange={e => setEditing({ ...editing, response_text: e.target.value })} />
                </div>
              ) : null}
            </div>
            <div className="modal-action">
              {editing.id && <button className="btn btn-error btn-sm btn-outline mr-auto" onClick={() => { handleDelete(editing.id!); setShowModal(false); }}><Trash2 size={14} /> Delete</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn btn-primary btn-sm ${saving ? 'loading' : ''}`} onClick={saveReview} disabled={saving}><Save size={14} /> Save</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
