import React, { useEffect, useState } from 'react';
import { Plus, Search, Users, X, Save, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import type { Customer } from '../types';
import { formatDate, SOURCES } from '../utils/helpers';
import * as api from '../api';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Customer> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const rows = await api.getCustomers();
      setCustomers(rows);
    } catch (err) { console.error('Failed to load customers:', err); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditing({ name: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '', source: '' });
    setShowModal(true);
  }

  function openEdit(c: Customer) {
    setEditing({ ...c });
    setShowModal(true);
  }

  async function saveCust() {
    if (!editing || !editing.name) return;
    setSaving(true);
    try {
      if (editing.id) {
        await api.updateCustomer(editing.id, editing);
      } else {
        await api.createCustomer(editing);
      }
      setShowModal(false);
      setEditing(null);
      loadData();
    } catch (err) { console.error('Failed to save customer:', err); }
    finally { setSaving(false); }
  }

  async function deleteCust(id: number) {
    try {
      await api.deleteCustomer(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
    } catch (err) { console.error('Failed to delete customer:', err); }
  }

  const filtered = customers.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return c.name.toLowerCase().includes(s) || c.email.toLowerCase().includes(s) || c.phone.includes(s) || c.city.toLowerCase().includes(s);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> New Customer</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          <Users size={48} className="mx-auto mb-3 opacity-30" />
          <p>No customers yet. Add your first customer!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(c => (
            <div key={c.id} className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => openEdit(c)}>
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm">{c.name}</div>
                    {c.source && <span className="badge badge-ghost badge-xs mt-1">{c.source}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-base-content/50 mt-1">
                  {c.phone && <span className="flex items-center gap-1"><Phone size={11} /> {c.phone}</span>}
                  {c.email && <span className="flex items-center gap-1"><Mail size={11} /> {c.email}</span>}
                  {c.city && <span className="flex items-center gap-1"><MapPin size={11} /> {c.city}{c.state ? `, ${c.state}` : ''}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editing && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing.id ? 'Edit Customer' : 'New Customer'}</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Name *</span></label>
                <input className="input input-bordered input-sm" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Phone</span></label>
                <input className="input input-bordered input-sm" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Email</span></label>
                <input className="input input-bordered input-sm" value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} />
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Address</span></label>
                <input className="input input-bordered input-sm" value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">City</span></label>
                <input className="input input-bordered input-sm" value={editing.city || ''} onChange={e => setEditing({ ...editing, city: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">State</span></label>
                <input className="input input-bordered input-sm" value={editing.state || ''} onChange={e => setEditing({ ...editing, state: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">ZIP</span></label>
                <input className="input input-bordered input-sm" value={editing.zip || ''} onChange={e => setEditing({ ...editing, zip: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Source</span></label>
                <select className="select select-bordered select-sm" value={editing.source || ''} onChange={e => setEditing({ ...editing, source: e.target.value })}>
                  <option value="">Select source</option>
                  {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Notes</span></label>
                <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              {editing.id && <button className="btn btn-error btn-sm btn-outline mr-auto" onClick={() => { deleteCust(editing.id!); setShowModal(false); }}><Trash2 size={14} /> Delete</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn btn-primary btn-sm ${saving ? 'loading' : ''}`} onClick={saveCust} disabled={saving}><Save size={14} /> Save</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
