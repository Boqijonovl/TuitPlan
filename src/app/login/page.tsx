"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      toast.success("Tizimga muvaffaqiyatli kirdingiz!");
      
      if (data.user.role === "ADMIN") {
        router.push("/dashboard/admin-monitoring");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      {/* Modest background decoration */}
      <div className="absolute top-0 right-0 w-full h-full bg-blue-600" style={{ clipPath: "polygon(50% 0, 100% 0%, 100% 100%, 0% 100%)" }}></div>
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob"></div>
      <div className="absolute top-40 -right-20 w-96 h-96 bg-white rounded-full filter blur-[80px] opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md p-8 md:p-10 rounded-xl bg-white shadow-sm border border-slate-200 relative z-10">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="text-center mb-8 shrink-0">
            <img src="/logo1.png" alt="TUIT" className="h-40 md:h-48 w-auto mx-auto object-contain transition-transform duration-500" />
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight mt-6">Tizimga kirish</h1>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3.5 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                placeholder="Email manzilingiz"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-12 py-3.5 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all focus:bg-white"
                placeholder="Parolingiz"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:bg-blue-600 tracking-wide"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                Tizimga kirish
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
