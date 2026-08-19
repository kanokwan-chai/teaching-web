"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/settings");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="animate-spin text-primary mb-4" size={48} />
      <p className="text-foreground/60 font-medium">กำลังเปลี่ยนหน้าไปที่ระบบจัดการแอดมิน...</p>
    </div>
  );
}
