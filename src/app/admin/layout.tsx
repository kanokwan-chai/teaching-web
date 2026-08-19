"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, BookOpen, FileText, Settings, LogOut, Image, Menu, X, User, MapPin, Calendar } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "admin_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/login");
  };
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().imageUrl) {
          setLogoUrl(docSnap.data().imageUrl);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
      }
    };
    fetchLogo();
  }, []);

  const menuItems = [
    { icon: <User size={20} />, name: "ข้อมูลส่วนตัว (Profile)", href: "/admin/settings" },
    { icon: <MapPin size={20} />, name: "ข้อมูลสถานศึกษา", href: "/admin/school" },
    { icon: <Calendar size={20} />, name: "ตารางสอน (Schedule)", href: "/admin/schedule" },
    { icon: <Image size={20} />, name: "รูปภาพกิจกรรม (Gallery)", href: "/admin/gallery" },
    { icon: <FileText size={20} />, name: "แผนการสอน (Lessons)", href: "/admin/lessons" },
    { icon: <BookOpen size={20} />, name: "บันทึกการฝึกสอน (Logs)", href: "/admin/logs" },
    { icon: <FileText size={20} />, name: "แบบประเมิน (Evaluation)", href: "/admin/evaluation" },
    { icon: <FileText size={20} />, name: "วิจัยในชั้นเรียน (Research)", href: "/admin/research" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} glass border-r border-glass-border flex flex-col hidden md:flex sticky top-0 h-screen transition-all duration-300`}>
        <div className="p-6 border-b border-glass-border">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-sm group-hover:scale-110 transition-transform">
              <img src="/favicon.ico" className="w-full h-full object-contain" alt="Logo" />
            </div>
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-foreground leading-tight">ระบบแอดมิน</h2>
                <p className="text-xs text-foreground/50">รายงานการฝึกสอน</p>
              </div>
            )}
          </Link>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? "bg-primary text-white font-bold shadow-md" 
                    : "text-foreground/70 hover:bg-white hover:text-foreground hover:shadow-sm"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 mt-auto">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-red-500 hover:bg-red-50 hover:shadow-sm font-medium"
          >
            <LogOut size={20} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
