"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Loader2, Sparkles, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import ImageCarousel from "@/components/ImageCarousel";

export default function LogsPage() {
  const [loading, setLoading] = useState(true);
  const [teachingLogs, setTeachingLogs] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [supervision, setSupervision] = useState<any>(null);
  const [activeTerm, setActiveTerm] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Teaching Logs
        const logsQ = query(collection(db, "teaching_logs"), orderBy("weekNumber", "asc"));
        const logsSnapshot = await getDocs(logsQ);
        const logsData: any[] = [];
        logsSnapshot.forEach((doc) => {
          logsData.push({ id: doc.id, ...doc.data() });
        });
        setTeachingLogs(logsData);

        // Fetch Supervision
        const supRef = doc(db, "settings", "supervision_terms");
        const supSnap = await getDoc(supRef);
        if (supSnap.exists()) {
          setSupervision(supSnap.data());
        } else {
          const oldRef = doc(db, "settings", "supervision");
          const oldSnap = await getDoc(oldRef);
          if (oldSnap.exists()) {
            setSupervision({ term1: oldSnap.data(), term2: null });
          }
        }

        // Fetch Student Works
        const q = query(collection(db, "student_works"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setWorks(data);
      } catch (error) {
        console.error("Error fetching logs data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="animate-spin text-primary" size={64} />
      </div>
    );
  }



  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
      <motion.div 
        className="text-center mb-12 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center justify-center p-6 bg-primary/10 rounded-full text-primary mb-6 neon-glow border border-primary/20">
          <FileText size={48} />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight">บันทึกการสอน</h1>
        <p className="text-foreground/70 text-lg max-w-2xl mx-auto mb-8">
          รายงานบันทึกการสอนประจำสัปดาห์ และผลงานชิ้นงานของนักเรียน
        </p>
        
        <div className="flex bg-white/50 p-1.5 rounded-2xl border border-white shadow-lg backdrop-blur-md">
          <button 
            onClick={() => setActiveTerm(1)}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTerm === 1 ? 'bg-primary text-white shadow-md scale-105' : 'text-foreground/70 hover:bg-white'}`}
          >
            ภาคเรียนที่ 1
          </button>
          <button 
            onClick={() => setActiveTerm(2)}
            className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTerm === 2 ? 'bg-primary text-white shadow-md scale-105' : 'text-foreground/70 hover:bg-white'}`}
          >
            ภาคเรียนที่ 2
          </button>
        </div>
      </motion.div>

      {/* Logic to get current term data */}
      {(() => {
        const currentSup = activeTerm === 1 ? supervision?.term1 : supervision?.term2;
        const currentLogs = teachingLogs.filter(l => (l.term || 1) === activeTerm);
        const currentWorks = works.filter(w => (w.term || 1) === activeTerm);

        return (
          <>
            {/* Supervision Info */}
            {currentSup && (
              <motion.div 
                key={`sup-${activeTerm}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 glass p-6 md:p-10 rounded-[2rem] border border-white/50 shadow-xl bg-white/40"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
              <FileText className="text-primary" />
              ตารางการนิเทศการสอน
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-green-400 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 p-6 rounded-2xl border border-primary/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h3 className="font-bold text-lg text-foreground mb-2">การนิเทศ On-site</h3>
              <div className="space-y-2 text-foreground/80">
                <p><strong>วันที่:</strong> {currentSup.onsite?.date || "-"}</p>
                <p><strong>วิชา:</strong> {currentSup.onsite?.subject || "-"}</p>
                <p><strong>อาจารย์นิเทศ:</strong> {currentSup.onsite?.teacher || "-"}</p>
              </div>
                {currentSup.onsite?.imageUrl && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden relative border border-gray-200 bg-black/5">
                    <img src={currentSup.onsite.imageUrl} alt="On-site" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>

            <div className="bg-white/60 p-6 rounded-2xl border border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h3 className="font-bold text-lg text-foreground mb-2">การนิเทศ Online (ครั้งที่ 1)</h3>
              <div className="space-y-2 text-foreground/80">
                <p><strong>วันที่:</strong> {currentSup.online1?.date || "-"}</p>
                <p><strong>วิชา:</strong> {currentSup.online1?.subject || "-"}</p>
                <p><strong>อาจารย์นิเทศ:</strong> {currentSup.online1?.teacher || "-"}</p>
                {currentSup.online1?.imageUrl && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden relative border border-gray-200 bg-black/5">
                    <img src={currentSup.online1.imageUrl} alt="Online 1" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white/60 p-6 rounded-2xl border border-blue-500/20 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h3 className="font-bold text-lg text-foreground mb-2">การนิเทศ Online (ครั้งที่ 2)</h3>
              <div className="space-y-2 text-foreground/80">
                <p><strong>วันที่:</strong> {currentSup.online2?.date || "-"}</p>
                <p><strong>วิชา:</strong> {currentSup.online2?.subject || "-"}</p>
                <p><strong>อาจารย์นิเทศ:</strong> {currentSup.online2?.teacher || "-"}</p>
                {currentSup.online2?.imageUrl && (
                  <div className="mt-4 aspect-video rounded-xl overflow-hidden relative border border-gray-200 bg-black/5">
                    <img src={currentSup.online2.imageUrl} alt="Online 2" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Teaching Logs Timeline */}
      <motion.div 
        key={`logs-${activeTerm}`}
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-4">บันทึกการทำงานรายสัปดาห์</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full"></div>
        </div>

        {currentLogs.length === 0 ? (
          <div className="text-center py-16 glass rounded-[2rem] border border-white/50 border-dashed bg-white/40">
            <FileText size={48} className="mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-foreground">ยังไม่มีบันทึกการสอนในเทอมนี้</h3>
          </div>
        ) : (
          <div className="space-y-8">
            {currentLogs.map((log, index) => (
              <motion.div 
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 shadow-sm bg-white/40"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-primary/20 pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-primary flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-lg">
                      {log.weekNumber}
                    </div>
                    สัปดาห์ที่ {log.weekNumber}
                  </h3>
                  <p className="text-foreground/60 font-medium mt-2 md:mt-0 bg-white/50 px-4 py-2 rounded-full border border-gray-100 w-fit">
                    {log.dateRange}
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Image */}
                  <div className="lg:w-1/3 flex-shrink-0">
                    {log.imageUrls && log.imageUrls.length > 0 ? (
                      <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white group relative">
                        {log.imageUrls.length > 1 ? (
                          <ImageCarousel 
                            images={log.imageUrls.map((url: string, index: number) => ({ id: index, url }))} 
                            itemWidth="w-full"
                            aspectRatio="aspect-square"
                            imageFit="contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-black/5 flex items-center justify-center">
                            <img src={log.imageUrls[0]} alt="Weekly Activities" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 pointer-events-none">
                              <p className="text-white font-bold">ประมวลภาพสัปดาห์ที่ {log.weekNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : log.imageUrl ? (
                      <div className="aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white group relative bg-black/5">
                        <img src={log.imageUrl} alt="Weekly Activities" className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6 pointer-events-none">
                          <p className="text-white font-bold">ประมวลภาพสัปดาห์ที่ {log.weekNumber}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-[2rem] bg-white/40 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 shadow-inner">
                        <ImageIcon size={48} className="mb-2 opacity-30" />
                        <p className="font-medium text-sm">ไม่มีรูปภาพประกอบ</p>
                      </div>
                    )}
                  </div>

                  {/* Right: Colored Daily Activities */}
                  <div className="lg:w-2/3 flex flex-col gap-3 justify-center">
                    {log.activities?.map((act: any, i: number) => {
                      const colors: Record<string, string> = {
                        "จันทร์": "border-yellow-400 bg-yellow-50/80 text-yellow-700",
                        "อังคาร": "border-pink-400 bg-pink-50/80 text-pink-700",
                        "พุธ": "border-green-400 bg-green-50/80 text-green-700",
                        "พฤหัสบดี": "border-orange-400 bg-orange-50/80 text-orange-700",
                        "ศุกร์": "border-blue-400 bg-blue-50/80 text-blue-700"
                      };
                      const isLeave = (act.leaveType && act.leaveType !== "none") || act.isHoliday;
                      const leaveType = act.leaveType || (act.isHoliday ? "holiday" : "none");
                      
                      const dayColor = leaveType === "holiday" ? "border-red-300 bg-red-50/80 text-red-500" : leaveType === "personal" ? "border-orange-300 bg-orange-50/80 text-orange-500" : leaveType === "sick" ? "border-purple-300 bg-purple-50/80 text-purple-500" : (colors[act.dayName] || "border-gray-200 bg-white");
                      
                      // Format date (convert 2026-05-15 to 15/05/2026 or similar if it's a date string)
                      const displayDate = act.date ? new Date(act.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }) : "";

                      return (
                        <div key={i} className={`p-4 rounded-xl border-l-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:shadow-md transition-shadow ${dayColor}`}>
                          <div className="w-24 flex-shrink-0">
                            <p className="font-bold text-lg">วัน{act.dayName}</p>
                            {displayDate && <p className="text-xs opacity-70">{displayDate}</p>}
                          </div>
                          
                          <div className="flex-1 bg-white/50 p-3 rounded-lg border border-white/50 w-full min-h-[3rem] flex items-center">
                            {isLeave ? (
                              <p className="font-bold opacity-80 text-center w-full">
                                {leaveType === 'holiday' ? 'ไม่ได้บันทึกการสอน (วันหยุด)' : leaveType === 'personal' ? 'ลากิจ' : 'ลาป่วย'}
                              </p>
                            ) : (
                              <div className="flex flex-col gap-2 w-full">
                                <p className="text-foreground/80 text-sm whitespace-pre-wrap leading-relaxed">
                                  {act.activity || <span className="opacity-40 italic">ไม่มีรายละเอียดกิจกรรม</span>}
                                </p>
                                {act.activityLink && (
                                  <a href={act.activityLink} target="_blank" rel="noopener noreferrer" className="text-accent text-sm font-medium hover:underline flex items-center gap-1.5 w-fit mt-1 bg-accent/5 px-3 py-1.5 rounded-lg border border-accent/10">
                                    <LinkIcon size={14} />
                                    ดูผลงาน/กิจกรรม
                                  </a>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Student Works Gallery */}
      <motion.div
        key={`works-${activeTerm}`}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-20 md:mt-28"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-accent mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-yellow-400" />
            ผลงานนักเรียน
            <Sparkles className="text-pink-400" />
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-accent to-orange-400 mx-auto rounded-full"></div>
        </div>

        {currentWorks.length === 0 ? (
          <div className="text-center py-20 bg-white/40 glass rounded-[2rem] border border-white/50 border-dashed">
            <ImageIcon size={64} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-foreground mb-2">ยังไม่มีผลงานนักเรียนในเทอมนี้</h2>
            <p className="text-gray-500">คุณสามารถอัปโหลดผลงานนักเรียนได้ที่ระบบแอดมิน</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {currentWorks.map((work, i) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="glass rounded-3xl overflow-hidden border border-white/50 bg-white/40 shadow-sm group hover:shadow-xl hover:shadow-accent/20 transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden relative bg-gray-50 flex items-center justify-center">
                  <img 
                    src={work.imageUrl} 
                    alt={work.title} 
                    className="w-full h-full object-cover absolute inset-0 z-0 group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                  />
                  <div className="hidden flex-col items-center justify-center p-4 text-center z-0 text-gray-400">
                    <FileText size={48} className="mb-2 opacity-50" />
                    <span className="text-xs break-all line-clamp-3 px-2">{work.imageUrl}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 z-10">
                    <p className="text-white font-bold text-lg drop-shadow-md translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      {work.title}
                    </p>
                  </div>
                </div>
                <div className="p-5 text-center group-hover:bg-white/60 transition-colors">
                  <a href={work.imageUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-foreground/80 line-clamp-1 hover:text-primary transition-colors">
                    {work.title}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
          </>
        );
      })()}
    </div>
  );
}
