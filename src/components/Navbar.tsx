"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUhN1uL-eya-663hhr7ScHaMgwNUBFz0NXKPhQ74t1FA&s");

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

  const links = [
    { name: "หน้าแรก", href: "/" },
    { name: "สถานศึกษา", href: "/school" },
    { name: "ตารางสอน", href: "/schedule" },
    { name: "แผนการสอน", href: "/lessons" },
    { name: "บันทึกการฝึกสอน", href: "/logs" },
    { name: "แบบประเมิน", href: "/evaluation" },
    { name: "วิจัยในชั้นเรียน", href: "/research" },
    { name: "ผู้จัดทำ", href: "/about" },
  ];

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
      <Link href="/" className="text-xl font-bold text-primary flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border-2 border-primary/20 overflow-hidden shadow-sm p-1">
          <img src={logoUrl} className="w-full h-full object-contain rounded-full" alt="Logo" />
        </div>
        <span className="hidden sm:inline">รายงานการฝึกสอน</span>
      </Link>

      {/* Desktop Menu */}
      <div className="hidden lg:flex gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`transition-colors font-medium ${
              pathname === link.href ? "text-accent" : "hover:text-accent"
            }`}
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Mobile Menu Toggle */}
      <button 
        className="lg:hidden text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full glass flex flex-col p-4 lg:hidden gap-4 border-t border-glass-border shadow-lg">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`transition-colors font-medium p-2 rounded-md ${
                pathname === link.href ? "text-accent bg-accent/10" : "hover:text-accent hover:bg-gray-100/50"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
