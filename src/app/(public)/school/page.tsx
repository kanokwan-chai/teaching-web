"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, User, Building, Loader2, Network } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function SchoolPage() {
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState({
    name: "วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี",
    address: "-",
    director: "-",
    mentor: "-",
    imageUrl: "",
    logoUrl: "",
    orgChartUrl: ""
  });

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        let localData: any = {};
        const res = await fetch("/api/local-images?folder=school");
        const json = await res.json();
        if (json.images && json.images.length > 0) {
          const imgs = json.images;
          // 1.* or logo -> Logo
          const logo = imgs.find((i: any) => i.name.includes("logo") || i.name.startsWith("1.")) || imgs[0];
          // 3.* or building/school -> Main School Image (รูปวิทยาลัย)
          const mainImg = imgs.find((i: any) => i.name.includes("building") || i.name.includes("school") || i.name.startsWith("3.")) || imgs.find((i: any) => i.name.startsWith("2.")) || imgs[0];
          // 2.* or org/chart -> Org Chart (ผังองค์กร)
          const orgChart = imgs.find((i: any) => i.name.includes("org") || i.name.includes("chart") || i.name.startsWith("2.")) || imgs[1];

          if (logo) localData.logoUrl = logo.url;
          if (mainImg) localData.imageUrl = mainImg.url;
          if (orgChart) localData.orgChartUrl = orgChart.url;
        }

        const docRef = doc(db, "school", "info");
        const docSnap = await getDoc(docRef);
        const dbData = docSnap.exists() ? (docSnap.data() as any) : {};
        
        // Strip out non-local image URLs
        const sanitizeUrl = (url: string | undefined, localFallback: string | undefined) => {
          if (localFallback) return localFallback;
          if (url && url.startsWith("/uploads/")) return url;
          return "";
        };

        setSchoolData({
          name: dbData.name || "วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี",
          address: dbData.address || "-",
          director: dbData.director || "-",
          mentor: dbData.mentor || "-",
          logoUrl: sanitizeUrl(dbData.logoUrl, localData.logoUrl),
          imageUrl: sanitizeUrl(dbData.imageUrl, localData.imageUrl),
          orgChartUrl: sanitizeUrl(dbData.orgChartUrl, localData.orgChartUrl),
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchoolData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={64} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <motion.div 
        className="text-center mb-16 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {schoolData.logoUrl ? (
          <div className="w-32 h-32 md:w-40 md:h-40 mb-6 rounded-full bg-white p-2 border-4 border-primary/20 shadow-xl relative group">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-50"></div>
            <img src={schoolData.logoUrl} alt="School Logo" className="w-full h-full object-contain relative z-10" />
          </div>
        ) : (
          <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-full text-primary mb-6 neon-glow border border-primary/20">
            <Building size={48} />
          </div>
        )}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">{schoolData.name}</h1>
        <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
          ข้อมูลสถานศึกษาที่ออกฝึกประสบการณ์วิชาชีพ
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
        {/* School Image */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-[2rem] overflow-hidden border border-white/50 shadow-md h-64 md:h-full min-h-[300px] md:min-h-[400px] relative"
        >
          {schoolData.imageUrl ? (
            <img src={schoolData.imageUrl} alt="School" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-white/40 flex flex-col items-center justify-center text-foreground/40">
              <Building size={64} className="mb-4 opacity-50" />
              <p>ยังไม่มีรูปภาพสถานศึกษา</p>
            </div>
          )}
        </motion.div>

        {/* School Details */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col justify-center space-y-6"
        >
          <div className="glass p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-start gap-4">
              <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                <Building size={28} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-primary mb-1">ชื่อสถานศึกษา</h3>
                <p className="text-2xl font-bold text-foreground">{schoolData.name}</p>
              </div>
            </div>
          </div>

          <div className="glass p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm relative overflow-hidden group hover:border-accent/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>
            <div className="flex items-start gap-4">
              <div className="p-4 bg-accent/10 text-accent rounded-2xl">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-accent mb-1">ที่อยู่</h3>
                <p className="text-lg text-foreground font-medium">{schoolData.address}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-blue-500 mb-1">ผู้อำนวยการ</h3>
                <p className="font-bold text-foreground">{schoolData.director}</p>
              </div>
            </div>
            
            <div className="glass p-6 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-500 mb-1">ครูพี่เลี้ยง</h3>
                <p className="font-bold text-foreground">{schoolData.mentor}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Org Chart */}
      {schoolData.orgChartUrl && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Network className="text-primary" size={32} />
              แผนผังองค์กร
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
          </div>
          
          <div className="glass p-4 md:p-8 rounded-[2rem] border border-white/50 bg-white/60 shadow-lg">
            <img src={schoolData.orgChartUrl} alt="Organizational Chart" className="w-full h-auto object-contain rounded-xl" />
          </div>
        </motion.div>
      )}
    </div>
  );
}
