import React from 'react';
import { LayoutDashboard, CalendarDays, Users, FileText, Receipt, HardHat, Star, LogOut, X } from 'lucide-react';
import type { Page } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  counts: { jobs: number; customers: number; estimates: number; invoices: number; crew: number; reviews: number };
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS: { page: Page; label: string; icon: React.ReactNode; countKey?: keyof SidebarProps['counts'] }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'jobs', label: 'Jobs', icon: <CalendarDays size={20} />, countKey: 'jobs' },
  { page: 'customers', label: 'Customers', icon: <Users size={20} />, countKey: 'customers' },
  { page: 'estimates', label: 'Estimates', icon: <FileText size={20} />, countKey: 'estimates' },
  { page: 'invoices', label: 'Invoices', icon: <Receipt size={20} />, countKey: 'invoices' },
  { page: 'crew', label: 'Crew', icon: <HardHat size={20} />, countKey: 'crew' },
  { page: 'reviews', label: 'Reviews', icon: <Star size={20} />, countKey: 'reviews' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, counts, isOpen, onClose }) => {
  const { user, logout } = useAuth();

  function handleNav(page: Page) {
    onNavigate(page);
    onClose(); // close mobile sidebar
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-60 shrink-0 bg-base-200 flex flex-col border-r border-base-300 h-full
          transform transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-base-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardHat size={26} className="text-primary" />
              <span className="font-bold text-lg tracking-tight">FieldBoss</span>
            </div>
            <button className="btn btn-ghost btn-sm btn-circle lg:hidden" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          {user && (
            <p className="text-xs text-base-content/50 mt-1 truncate" title={user.businessName}>
              {user.businessName || 'My Business'}
            </p>
          )}
        </div>

        {/* Navigation */}
        <ul className="menu menu-md flex-1 p-2 gap-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.page}>
              <a
                className={currentPage === item.page ? 'active font-semibold' : ''}
                onClick={() => handleNav(item.page)}
              >
                {item.icon}
                <span className="flex-1">{item.label}</span>
                {item.countKey && counts[item.countKey] > 0 && (
                  <span className="badge badge-sm badge-ghost">{counts[item.countKey]}</span>
                )}
              </a>
            </li>
          ))}
        </ul>

        {/* User / Logout */}
        <div className="p-3 border-t border-base-300">
          {user && (
            <div className="text-xs text-base-content/50 mb-2 truncate" title={user.email}>
              {user.email}
            </div>
          )}
          <button className="btn btn-ghost btn-sm w-full justify-start gap-2" onClick={logout}>
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};
