import React, { useEffect, useState } from 'react';
import { Plus, Search, HardHat, X, Save, Trash2, Phone, Mail } from 'lucide-react';
import type { CrewMember, CrewStatus } from '../types';
import { formatCurrency, TRADES } from '../utils/helpers';
import * as api from '../api';

export const Crew: React.FC = () => {
  const [crew, setCrew] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<CrewMember> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const rows = await api.getCrew();
      setCrew(rows);
    } catch (err) { console.error('Failed to load crew:', err); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditing({ name: '', phone: '', email: '', role: '', trade: '', hourly_rate: 0, status: 'active', notes: '' });
    setShowModal(true);
  }

  function openEdit(m: CrewMember) {
    setEditing({ ...m });
    setShowModal(true);
  }

  async function saveMember() {
    if (!editing || !editing.name) return;
    setSaving(true);
    try {
      if (editing.id) {
        await api.updateCrewMember(editing.id, editing);
      } else {
        await api.createCrewMember(editing);
      }
      setShowModal(false);
      loadData();
    } catch (err) { console.error('Failed to save crew member:', err); }
    finally { setSaving(false); }
  }

  async function deleteMember(id: number) {
    try {
      await api.deleteCrewMember(id);
      setCrew(prev => prev.filter(m => m.id !== id));
    } catch (err) { console.error('Failed to delete crew member:', err); }
  }

  const filtered = crew.filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return m.name.toLowerCase().includes(s) || m.role.toLowerCase().includes(s) || m.trade.toLowerCase().includes(s);
  });

  if (loading) return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="Search crew..." value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> Add Member</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          <HardHat size={48} className="mx-auto mb-3 opacity-30" />
          <p>No crew members yet. Add your first team member!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filtered.map(m => (
            <div key={m.id} className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => openEdit(m)}>
              <div className="card-body p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {m.name}
                      <span className={`badge badge-xs ${m.status === 'active' ? 'badge-success' : 'badge-error'}`}>{m.status}</span>
                    </div>
                    <div className="text-xs text-base-content/50 mt-0.5">
                      {m.role && <span>{m.role}</span>}
                      {m.role && m.trade && <span> • </span>}
                      {m.trade && <span>{m.trade}</span>}
                    </div>
                  </div>
                  {m.hourly_rate > 0 && <span className="text-sm font-mono text-success">{formatCurrency(m.hourly_rate)}/hr</span>}
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-base-content/50 mt-1">
                  {m.phone && <span className="flex items-center gap-1"><Phone size={11} /> {m.phone}</span>}
                  {m.email && <span className="flex items-center gap-1"><Mail size={11} /> {m.email}</span>}
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
              <h3 className="font-bold text-lg">{editing.id ? 'Edit Crew Member' : 'Add Crew Member'}</h3>
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
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Role</span></label>
                <input className="input input-bordered input-sm" value={editing.role || ''} onChange={e => setEditing({ ...editing, role: e.target.value })} placeholder="e.g. Lead Tech" />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Trade</span></label>
                <select className="select select-bordered select-sm" value={editing.trade || ''} onChange={e => setEditing({ ...editing, trade: e.target.value })}>
                  <option value="">Select trade</option>
                  {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Hourly Rate ($)</span></label>
                <input type="number" className="input input-bordered input-sm" value={editing.hourly_rate || 0} onChange={e => setEditing({ ...editing, hourly_rate: Number(e.target.value) })} min={0} step={0.5} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Status</span></label>
                <select className="select select-bordered select-sm" value={editing.status || 'active'} onChange={e => setEditing({ ...editing, status: e.target.value as CrewStatus })}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Notes</span></label>
                <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
              </div>
            </div>
            <div className="modal-action">
              {editing.id && <button className="btn btn-error btn-sm btn-outline mr-auto" onClick={() => { deleteMember(editing.id!); setShowModal(false); }}><Trash2 size={14} /> Delete</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn btn-primary btn-sm ${saving ? 'loading' : ''}`} onClick={saveMember} disabled={saving}><Save size={14} /> Save</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
