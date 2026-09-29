import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button.jsx';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 font-black text-2xl">
          404
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          The screen or resource you are looking for does not exist or may have been moved.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link to="/dashboard">
            <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
