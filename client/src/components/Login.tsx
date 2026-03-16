import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TRADES } from '../utils/helpers';

export const Login: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [trade, setTrade] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required.');
      return;
    }
    if (isRegister && !businessName) {
      setError('Business name is required.');
      return;
    }

    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, businessName, trade);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 p-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl">
        <div className="card-body">
          {/* Logo / Title */}
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">👷</div>
            <h1 className="text-2xl font-bold tracking-tight text-primary">FieldBoss</h1>
            <p className="text-sm text-base-content/50 mt-1">Business Command Center</p>
          </div>

          {/* Tab toggle */}
          <div className="tabs tabs-boxed mb-4 justify-center">
            <button
              className={`tab ${!isRegister ? 'tab-active' : ''}`}
              onClick={() => { setIsRegister(false); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`tab ${isRegister ? 'tab-active' : ''}`}
              onClick={() => { setIsRegister(true); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2 mb-2">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Email</span></label>
              <input
                type="email"
                className="input input-bordered input-sm"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text text-xs">Password</span></label>
              <input
                type="password"
                className="input input-bordered input-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
            </div>

            {isRegister && (
              <>
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Business Name *</span></label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    placeholder="e.g. Smith Plumbing LLC"
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text text-xs">Trade</span></label>
                  <select
                    className="select select-bordered select-sm"
                    value={trade}
                    onChange={e => setTrade(e.target.value)}
                  >
                    <option value="">Select your trade</option>
                    {TRADES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              className={`btn btn-primary btn-sm w-full mt-2 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? '' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-base-content/40 mt-4">
            {isRegister
              ? 'Already have an account? '
              : "Don't have an account? "
            }
            <button
              className="link link-primary"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
            >
              {isRegister ? 'Sign in' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
