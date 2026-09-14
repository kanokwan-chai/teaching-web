"use client";

import { useState, useEffect } from "react";
import { Save, UploadCloud, Trash2, Loader2, Image as ImageIcon, FileText, Edit } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { uploadImage } from "@/lib/upload";
import WeeklyLogForm from "./WeeklyLogForm";
import SupervisionForm from "./SupervisionForm";

export default function AdminLogs() {
  const [loading, setLoading] = useState(true);
  const [savingWork, setSavingWork] = useState(false);
  const [savingSupervision, setSavingSupervision] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  const [activeTerm, setActiveTerm] = useState(1);
  
  const [teachingLogs, setTeachingLogs] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [workLink, setWorkLink] = useState("");
  const [workTitle, setWorkTitle] = useState("");
  const [workTerm, setWorkTerm] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Teaching Logs directly from Firebase Firestore
      const logsData: any[] = [];
      try {
        const logsSnapshot = await getDocs(collection(db, "teaching_logs"));
        logsSnapshot.forEach((docSnap) => {
          const d = docSnap.data();
          const weekNum = Number(d.weekNumber || d.week || 1);
          const termNum = Number(d.term || 1);
          
          // Extract all image URLs from Firebase without stripping http/https/data URLs
          const rawUrls = d.imageUrls || (d.imageUrl ? [d.imageUrl] : []);
          const validUrls = Array.from(new Set(
            rawUrls.filter((u: any) => u && typeof u === "string" && u.trim() !== "")
          ));

          logsData.push({
            id: docSnap.id,
            ...d,
            weekNumber: weekNum,
            term: termNum,
            dateRange: d.dateRange || `สัปดาห์ที่ ${weekNum}`,
            imageUrls: validUrls,
            imageUrl: validUrls[0] || "",
            activities: Array.isArray(d.activities) && d.activities.length > 0 ? d.activities : undefined
          });
        });
      } catch (dbErr) {
        console.warn("Firestore admin logs fetch notice:", dbErr);
      }

      // 2. Merge local images and ensure all 20 weeks exist for Term 1 and Term 2
      const localWeeklyLogs: any[] = [];
      try {
        const res = await fetch("/api/local-images?folder=logs&recursive=true");
        const json = await res.json();
        const tree = json.tree || {};

        for (let t = 1; t <= 2; t++) {
          for (let w = 1; w <= 20; w++) {
            const folderKey = `logs/term-${t}/week-${w}`;
            const folderImages = tree[folderKey] || [];
            const localUrls = folderImages.map((i: any) => i.url);

            const existingDbIndex = logsData.findIndex(l => Number(l.term) === t && Number(l.weekNumber) === w);

            if (existingDbIndex !== -1) {
              // Document exists in Firebase: preserve Firebase content 100%, append local image URLs if any
              const dbLog = logsData[existingDbIndex];
              const mergedUrls = Array.from(new Set([...dbLog.imageUrls, ...localUrls]));
              logsData[existingDbIndex] = {
                ...dbLog,
                imageUrls: mergedUrls,
                imageUrl: dbLog.imageUrl || mergedUrls[0] || ""
              };
            } else {
              // No document in Firebase: create fallback placeholder
              localWeeklyLogs.push({
                id: `local_log_t${t}_w${w}`,
                term: t,
                weekNumber: w,
                dateRange: `สัปดาห์ที่ ${w}`,
                imageUrls: localUrls,
                imageUrl: localUrls[0] || "",
                activities: [
                  { dayName: "จันทร์", activity: "เช็คชื่อหน้าเสาธงและสอนรายวิชาการสร้างเว็บไซต์ ปวช.1", leaveType: "none", isHoliday: false },
                  { dayName: "อังคาร", activity: "เช็คชื่อหน้าเสาธงและสอนรายวิชาคณิตศาสตร์คอมพิวเตอร์", leaveType: "none", isHoliday: false },
                  { dayName: "พุธ", activity: "เช็คชื่อหน้าเสาธงและปฏิบัติหน้าที่การสอน", leaveType: "none", isHoliday: false },
                  { dayName: "พฤหัสบดี", activity: "เช็คชื่อหน้าเสาธงและปฏิบัติหน้าที่การสอน", leaveType: "none", isHoliday: false },
                  { dayName: "ศุกร์", activity: "เช็คชื่อหน้าเสาธงและสรุปผลการจัดการเรียนรู้ประจำสัปดาห์", leaveType: "none", isHoliday: false }
                ]
              });
            }
          }
        }
      } catch (e) {
        console.error("Error scanning local logs in admin:", e);
      }

      const combinedLogs = [...logsData, ...localWeeklyLogs].sort((a, b) => {
        if (Number(a.term || 1) !== Number(b.term || 1)) {
          return Number(a.term || 1) - Number(b.term || 1);
        }
        return Number(a.weekNumber) - Number(b.weekNumber);
      });

      setTeachingLogs(combinedLogs);


      // Fetch Student Works safely without strict query ordering
      try {
        const querySnapshot = await getDocs(collection(db, "student_works"));
        const data: any[] = [];
        querySnapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setWorks(data.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")));
      } catch (workErr) {
        console.warn("Firestore student_works fetch notice:", workErr);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeachingLog = async (id: string) => {
    if (!confirm("คุณต้องการลบบันทึกการสอนสัปดาห์นี้ใช่หรือไม่?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "teaching_logs", id));
      fetchData();
    } catch (error) {
      console.error("Error deleting teaching log:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
      setLoading(false);
    }
  };


  const handleUploadWork = async () => {
    if (!workLink || !workTitle) {
      alert("กรุณากรอกชื่อผลงานและวางลิงก์");
      return;
    }

    setSavingWork(true);
    try {
      await addDoc(collection(db, "student_works"), {
        title: workTitle,
        term: workTerm,
        imageUrl: workLink,
        createdAt: new Date().toISOString()
      });

      alert("เพิ่มผลงานนักเรียนสำเร็จ!");
      setWorkTitle("");
      setWorkLink("");
      fetchData();
    } catch (error) {
      console.error("Error uploading work:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มผลงาน");
    } finally {
      setSavingWork(false);
    }
  };

  const handleDeleteWork = async (id: string, imageUrl: string) => {
    if (!confirm("คุณต้องการลบผลงานนี้ใช่หรือไม่?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "student_works", id));
      // ImgBB doesn't require explicit deletion from our end for this simple integration,
      // or we can just ignore deleting the image on ImgBB since it's free hosting.
      fetchData();
    } catch (error) {
      console.error("Error deleting work:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
      setLoading(false);
    }
  };

  if (loading && works.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <header>
          <h1 className="text-3xl font-bold text-foreground">บันทึกการสอน & ผลงานนักเรียน</h1>
        </header>
      </div>

      <div className="mb-8">
        <WeeklyLogForm 
          onSaved={() => { fetchData(); setEditingLog(null); }} 
          editLog={editingLog} 
          onCancelEdit={() => setEditingLog(null)} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column - Forms */}
        <div className="space-y-8">

          {/* Student Works Form */}
          <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm">
            <h2 className="text-xl font-bold text-accent border-b border-accent/20 pb-2 mb-6 flex items-center gap-2">
              <ImageIcon size={20} /> เพิ่มผลงานนักเรียน
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">ภาคเรียนที่</label>
                <select 
                  value={workTerm}
                  onChange={(e) => setWorkTerm(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
                >
                  <option value={1}>ภาคเรียนที่ 1</option>
                  <option value={2}>ภาคเรียนที่ 2</option>
                </select>
                
                <label className="block text-sm font-bold text-foreground mb-2">ชื่อผลงาน / คำอธิบายสั้นๆ</label>
                <input 
                  type="text" 
                  value={workTitle}
                  onChange={(e) => setWorkTitle(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="เช่น ชิ้นงานออกแบบเว็บไซต์" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">ลิงก์ผลงาน (URL)</label>
                <div className="relative">
                  <input 
                    type="url" 
                    value={workLink}
                    onChange={(e) => setWorkLink(e.target.value)}
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    placeholder="วางลิงก์ผลงาน หรือ ลิงก์รูปภาพ..." 
                  />
                </div>
              </div>
              
              <button 
                onClick={handleUploadWork}
                disabled={savingWork}
                className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-orange-600 transition-colors mt-6 shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <UploadCloud size={20} />
                เพิ่มผลงาน
              </button>
            </div>
          </div>

        </div>

        {/* Right Column - Logs List & Supervision */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Teaching Logs List */}
          <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-primary/20 pb-4 mb-6 gap-4">
              <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                <FileText size={20} /> บันทึกการสอนย้อนหลัง
              </h2>
              
              <div className="flex bg-white/60 p-1 rounded-xl border border-gray-200 shadow-inner">
                <button
                  onClick={() => setActiveTerm(1)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    activeTerm === 1
                      ? "bg-primary text-white shadow-md"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/40"
                  }`}
                >
                  ภาคเรียนที่ 1
                </button>
                <button
                  onClick={() => setActiveTerm(2)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    activeTerm === 2
                      ? "bg-primary text-white shadow-md"
                      : "text-foreground/70 hover:text-foreground hover:bg-white/40"
                  }`}
                >
                  ภาคเรียนที่ 2
                </button>
              </div>
            </div>
            
            {teachingLogs.filter(log => Number(log.term || 1) === activeTerm).length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>ยังไม่มีบันทึกการสอนสำหรับภาคเรียนที่ {activeTerm}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teachingLogs.filter(log => Number(log.term || 1) === activeTerm).map(log => (
                  <div key={log.id} className="bg-white/50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:shadow-md transition-shadow">
                    <div>
                      <h3 className="font-bold text-foreground flex items-center gap-2">
                        สัปดาห์ที่ {log.weekNumber}
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20">
                          เทอม {log.term || 1}
                        </span>
                      </h3>
                      <p className="text-sm text-foreground/70">{log.dateRange}</p>
                      <p className="text-xs text-foreground/50 mt-1">กิจกรรม {log.activities?.length || 0} รายการ</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingLog(log);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="p-3 text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                      >
                        <Edit size={20} />
                      </button>
                      <button 
                        onClick={() => handleDeleteTeachingLog(log.id)}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <SupervisionForm />

          <div className="space-y-4">
            <h2 className="text-xl font-bold mb-6">คลังผลงานนักเรียน</h2>
          
          {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : works.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white/30 rounded-[2rem] border border-dashed border-gray-300">
              <ImageIcon size={48} className="mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีรูปภาพผลงานนักเรียน</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {works.map((work) => (
                <div key={work.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover absolute inset-0 z-0" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }} />
                  <div className="hidden flex-col items-center justify-center p-4 text-center z-0 text-gray-400">
                    <FileText size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] break-all line-clamp-3">{work.imageUrl}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <p className="text-white font-bold text-sm drop-shadow-md line-clamp-1">{work.title}</p>
                    <span className="text-[10px] bg-white/20 text-white w-fit px-2 py-0.5 rounded-full backdrop-blur-sm mt-1 mb-2">
                      เทอม {work.term || 1}
                    </span>
                    <button 
                      onClick={() => handleDeleteWork(work.id, work.imageUrl)}
                      className="w-fit p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
