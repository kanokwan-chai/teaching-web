"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // The password requested by user is admin1234
    if (password === "admin1234") {
      // Set cookie for 30 days
      document.cookie = "admin_auth=true; path=/; max-age=" + 60 * 60 * 24 * 30;
      router.push("/admin/settings");
      router.refresh();
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white shadow-2xl bg-white/60 backdrop-blur-xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/20 shadow-inner">
              <Lock size={32} />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">เข้าสู่ระบบจัดการ</h1>
            <p className="text-foreground/60">กรุณาใส่รหัสผ่านเพื่อเข้าสู่ระบบแอดมิน</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">
                รหัสผ่าน (Password)
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={`w-full p-4 rounded-xl border bg-white/70 focus:outline-none focus:ring-2 transition-all ${
                  error 
                    ? "border-red-400 focus:ring-red-500/50" 
                    : "border-gray-200 focus:border-primary focus:ring-primary/50"
                }`}
                placeholder="••••••••"
                required
              />
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1 font-medium">
                  <AlertCircle size={16} /> รหัสผ่านไม่ถูกต้อง
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
            >
              <LogIn size={20} />
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-foreground/50">
            &copy; {new Date().getFullYear()} Teaching Practicum System
          </div>
        </div>
      </div>
    </div>
  );
}
