import React, { useEffect, useState } from 'react';
import { Plus, Search, Receipt, X, Save, Trash2, PlusCircle, MinusCircle, CheckCircle } from 'lucide-react';
import type { Invoice, Customer, LineItem, InvoiceStatus } from '../types';
import { formatCurrency, formatDate, statusColor, statusLabel, parseLineItems, todayStr } from '../utils/helpers';
import * as api from '../api';

export const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Invoice> | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [iRows, cRows] = await Promise.all([
        api.getInvoices(),
        api.getCustomers(),
      ]);
      setInvoices(iRows);
      setCustomers(cRows);
    } catch (err) { console.error('Failed to load invoices:', err); }
    finally { setLoading(false); }
  }

  function openNew() {
    setEditing({ title: '', customer_id: null, status: 'draft', tax_rate: 0, due_date: '', notes: '' });
    setLineItems([{ description: '', qty: 1, rate: 0, total: 0 }]);
    setShowModal(true);
  }

  function openEdit(inv: Invoice) {
    setEditing({ ...inv });
    setLineItems(parseLineItems(inv.items));
    setShowModal(true);
  }

  function updateLineItem(idx: number, field: keyof LineItem, value: string | number) {
    setLineItems(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      if (field === 'qty' || field === 'rate') {
        updated[idx].total = Number(updated[idx].qty) * Number(updated[idx].rate);
      }
      return updated;
    });
  }

  function addLineItem() { setLineItems(prev => [...prev, { description: '', qty: 1, rate: 0, total: 0 }]); }
  function removeLineItem(idx: number) { setLineItems(prev => prev.filter((_, i) => i !== idx)); }

  function calcTotals() {
    const subtotal = lineItems.reduce((s, li) => s + li.total, 0);
    const taxRate = Number(editing?.tax_rate || 0);
    const tax = subtotal * (taxRate / 100);
    return { subtotal, tax, total: subtotal + tax };
  }

  async function saveInvoice() {
    if (!editing || !editing.title) return;
    const { subtotal, tax, total } = calcTotals();
    setSaving(true);
    try {
      const payload = {
        ...editing,
        items: JSON.stringify(lineItems),
        subtotal,
        tax,
        total,
      };
      if (editing.id) {
        await api.updateInvoice(editing.id, payload);
      } else {
        await api.createInvoice(payload);
      }
      setShowModal(false);
      loadData();
    } catch (err) { console.error('Failed to save invoice:', err); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    try {
      await api.deleteInvoice(id);
      setInvoices(prev => prev.filter(i => i.id !== id));
    } catch (err) { console.error('Failed to delete invoice:', err); }
  }

  async function markPaid(id: number) {
    try {
      await api.updateInvoice(id, { status: 'paid', paid_date: todayStr() });
      setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'paid' as InvoiceStatus, paid_date: todayStr() } : i));
    } catch (err) { console.error('Failed to mark paid:', err); }
  }

  const filtered = invoices.filter(i => {
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || (i.customer_name || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const { subtotal, tax, total } = calcTotals();

  if (loading) return <div className="flex items-center justify-center h-64"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <label className="input input-bordered input-sm flex items-center gap-2 flex-1 min-w-48">
          <Search className="h-[1em] opacity-50" />
          <input type="search" className="grow" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)} />
        </label>
        <select className="select select-bordered select-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
        <button className="btn btn-primary btn-sm" onClick={openNew}><Plus size={16} /> New Invoice</button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-base-content/50">
          <Receipt size={48} className="mx-auto mb-3 opacity-30" />
          <p>No invoices yet. Create your first invoice!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(inv => (
            <div key={inv.id} className="card bg-base-200 cursor-pointer hover:bg-base-300 transition-colors" onClick={() => openEdit(inv)}>
              <div className="card-body p-4 flex-row items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{inv.title}</div>
                  <div className="text-xs text-base-content/50 mt-1">
                    {inv.customer_name || 'No customer'} • {formatDate(inv.created_at)}
                    {inv.due_date && <> • Due {formatDate(inv.due_date)}</>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-bold">{formatCurrency(inv.total)}</span>
                  <span className={`badge badge-sm ${statusColor(inv.status)}`}>{statusLabel(inv.status)}</span>
                  {inv.status !== 'paid' && (
                    <button className="btn btn-success btn-xs" onClick={(ev) => { ev.stopPropagation(); markPaid(inv.id); }} title="Mark Paid"><CheckCircle size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && editing && (
        <div className="modal modal-open">
          <div className="modal-box max-w-3xl max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{editing.id ? 'Edit Invoice' : 'New Invoice'}</h3>
              <button className="btn btn-ghost btn-sm btn-circle" onClick={() => setShowModal(false)}><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              <div className="form-control md:col-span-2">
                <label className="label"><span className="label-text text-xs">Title *</span></label>
                <input className="input input-bordered input-sm" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Status</span></label>
                <select className="select select-bordered select-sm" value={editing.status || 'draft'} onChange={e => setEditing({ ...editing, status: e.target.value as InvoiceStatus })}>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Customer</span></label>
                <select className="select select-bordered select-sm" value={editing.customer_id ?? ''} onChange={e => setEditing({ ...editing, customer_id: e.target.value ? Number(e.target.value) : null })}>
                  <option value="">No customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Tax Rate (%)</span></label>
                <input type="number" className="input input-bordered input-sm" value={editing.tax_rate || 0} onChange={e => setEditing({ ...editing, tax_rate: Number(e.target.value) })} min={0} step={0.1} />
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text text-xs">Due Date</span></label>
                <input type="date" className="input input-bordered input-sm" value={editing.due_date || ''} onChange={e => setEditing({ ...editing, due_date: e.target.value })} />
              </div>
            </div>

            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Line Items</span>
                <button className="btn btn-ghost btn-xs" onClick={addLineItem}><PlusCircle size={14} /> Add Item</button>
              </div>
              <div className="space-y-2">
                {lineItems.map((li, idx) => (
                  <div key={idx} className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <input className="input input-bordered input-sm flex-1 min-w-32" placeholder="Description" value={li.description} onChange={e => updateLineItem(idx, 'description', e.target.value)} />
                    <input type="number" className="input input-bordered input-sm w-16" placeholder="Qty" value={li.qty} onChange={e => updateLineItem(idx, 'qty', Number(e.target.value))} min={1} />
                    <input type="number" className="input input-bordered input-sm w-24" placeholder="Rate" value={li.rate} onChange={e => updateLineItem(idx, 'rate', Number(e.target.value))} min={0} step={0.01} />
                    <span className="text-sm font-mono w-20 text-right">{formatCurrency(li.total)}</span>
                    <button className="btn btn-ghost btn-xs btn-circle" onClick={() => removeLineItem(idx)}><MinusCircle size={14} /></button>
                  </div>
                ))}
              </div>
              <div className="divider my-2" />
              <div className="text-right space-y-1 text-sm">
                <div>Subtotal: <span className="font-mono">{formatCurrency(subtotal)}</span></div>
                <div>Tax ({editing.tax_rate || 0}%): <span className="font-mono">{formatCurrency(tax)}</span></div>
                <div className="font-bold text-base">Total: <span className="font-mono text-success">{formatCurrency(total)}</span></div>
              </div>
            </div>

            <div className="form-control mb-3">
              <label className="label"><span className="label-text text-xs">Notes</span></label>
              <textarea className="textarea textarea-bordered textarea-sm" rows={2} value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
            </div>

            <div className="modal-action">
              {editing.id && <button className="btn btn-error btn-sm btn-outline mr-auto" onClick={() => { handleDelete(editing.id!); setShowModal(false); }}><Trash2 size={14} /> Delete</button>}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
              <button className={`btn btn-primary btn-sm ${saving ? 'loading' : ''}`} onClick={saveInvoice} disabled={saving}><Save size={14} /> Save</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setShowModal(false)} />
        </div>
      )}
    </div>
  );
};
