import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/FormInput';
import { GraduationCap, LogIn, Sparkles, Shield, Building2, User } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        const user = result.user;
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'recruiter') navigate('/recruiter');
        else navigate('/student');
      }
    } else {
      setError(result.message || 'Invalid email or password.');
    }
  };

  const handleQuickFill = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-100 mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to CampusHire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Access your student, recruiter, or administrative workspace.
          </p>
        </div>

        {/* Demo Credentials Quick-Select Pill Grid */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Demo 1-Click Fill
            </span>
            <span className="text-[11px] text-slate-400">Pre-seeded accounts</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-left">
            <button
              type="button"
              onClick={() => handleQuickFill('arjun.sharma@college.edu', 'Password@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs text-slate-700 transition"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <User className="w-3 h-3 text-indigo-600" />
                <span>Student (Eligible)</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Arjun Sharma (8.8 CGPA)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('vikram.nair@college.edu', 'Password@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 text-xs text-slate-700 transition"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <User className="w-3 h-3 text-indigo-600" />
                <span>Student (Ineligible)</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Vikram Nair (5.9 CGPA)</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('recruiter.google@campushire.com', 'Password@123')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-xs text-slate-700 transition"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <Building2 className="w-3 h-3 text-blue-600" />
                <span>Recruiter (Google)</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Sarah Jenkins</p>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@campushire.com', 'Admin@Campus2026!')}
              className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 text-xs text-slate-700 transition"
            >
              <div className="flex items-center gap-1 font-semibold text-slate-900">
                <Shield className="w-3 h-3 text-purple-600" />
                <span>Administrator</span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">Campus Placement Cell</p>
            </button>
          </div>
        </div>

        {/* Main Login Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="you@college.edu or name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
