import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl backdrop-blur-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-slate-400 mb-6">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
