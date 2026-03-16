import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import type { Page } from './types';
import { useAuth } from './context/AuthContext';
import { getDashboard } from './api';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Jobs } from './components/Jobs';
import { Customers } from './components/Customers';
import { Estimates } from './components/Estimates';
import { Invoices } from './components/Invoices';
import { Crew } from './components/Crew';
import { Reviews } from './components/Reviews';

const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard',
  jobs: 'Jobs',
  customers: 'Customers',
  estimates: 'Estimates',
  invoices: 'Invoices',
  crew: 'Crew',
  reviews: 'Reviews',
};

export const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [counts, setCounts] = useState({ jobs: 0, customers: 0, estimates: 0, invoices: 0, crew: 0, reviews: 0 });

  // Load sidebar counts from dashboard API
  useEffect(() => {
    if (isAuthenticated) {
      loadCounts();
    }
  }, [isAuthenticated, currentPage]);

  async function loadCounts() {
    try {
      const data = await getDashboard();
      if (data.counts) {
        setCounts(data.counts);
      }
    } catch {
      // Silently fail — counts are just nice-to-have
    }
  }

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm text-base-content/50 mt-3">Loading FieldBoss...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → show login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Authenticated → show app
  function renderPage() {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'jobs':
        return <Jobs />;
      case 'customers':
        return <Customers />;
      case 'estimates':
        return <Estimates />;
      case 'invoices':
        return <Invoices />;
      case 'crew':
        return <Crew />;
      case 'reviews':
        return <Reviews />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  }

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden" data-theme="fieldboss">
      {/* Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        counts={counts}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center gap-3 p-3 border-b border-base-300 bg-base-100">
          <button className="btn btn-ghost btn-sm btn-square" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">{PAGE_TITLES[currentPage]}</span>
        </div>

        {/* Page header (desktop) */}
        <div className="hidden lg:flex items-center p-4 border-b border-base-300">
          <h1 className="text-lg font-bold">{PAGE_TITLES[currentPage]}</h1>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {renderPage()}
        </div>
      </div>
    </div>
  );
};
