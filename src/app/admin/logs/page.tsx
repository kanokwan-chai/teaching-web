"use client";

import { useState, useEffect } from "react";
import { Save, UploadCloud, Trash2, Loader2, Image as ImageIcon, FileText, Edit } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";
import WeeklyLogForm from "./WeeklyLogForm";
import SupervisionForm from "./SupervisionForm";

export default function AdminLogs() {
  const [loading, setLoading] = useState(true);
  const [savingWork, setSavingWork] = useState(false);
  const [savingSupervision, setSavingSupervision] = useState(false);
  const [editingLog, setEditingLog] = useState<any>(null);
  
  const [teachingLogs, setTeachingLogs] = useState<any[]>([]);
  const [works, setWorks] = useState<any[]>([]);
  const [workFile, setWorkFile] = useState<File | null>(null);
  const [workTitle, setWorkTitle] = useState("");
  const [workTerm, setWorkTerm] = useState(1);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Teaching Logs
      const logsQ = query(collection(db, "teaching_logs"), orderBy("weekNumber", "desc"));
      const logsSnapshot = await getDocs(logsQ);
      const logsData: any[] = [];
      logsSnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() });
      });
      setTeachingLogs(logsData);


      // Fetch Student Works
      const q = query(collection(db, "student_works"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setWorks(data);
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


  const handleWorkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWorkFile(e.target.files[0]);
    }
  };

  const handleUploadWork = async () => {
    if (!workFile || !workTitle) {
      alert("กรุณากรอกชื่อผลงานและเลือกรูปภาพ");
      return;
    }

    setSavingWork(true);
    try {
      const imageUrl = await uploadToImgBB(workFile);

      await addDoc(collection(db, "student_works"), {
        title: workTitle,
        term: workTerm,
        imageUrl: imageUrl,
        createdAt: new Date().toISOString()
      });

      alert("เพิ่มผลงานนักเรียนสำเร็จ!");
      setWorkTitle("");
      setWorkFile(null);
      fetchData();
    } catch (error) {
      console.error("Error uploading work:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
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
          <h1 className="text-3xl font-bold text-foreground mb-2">บันทึกการสอน & ผลงานนักเรียน</h1>
          <p className="text-foreground/60">เพิ่มบันทึกการสอนรายสัปดาห์ และอัปโหลดผลงานนักเรียน</p>
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
                <label className="block text-sm font-bold text-foreground mb-2">รูปภาพผลงาน</label>
                <label className={`w-full h-32 rounded-xl border-2 border-dashed ${workFile ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white/30'} flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden`}>
                  <input type="file" accept="image/*" className="hidden" onChange={handleWorkFileChange} />
                  {workFile ? (
                    <img src={URL.createObjectURL(workFile)} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud size={32} className="mb-2" />
                      <p className="text-sm">คลิกเพื่อเลือกรูปภาพ</p>
                    </>
                  )}
                </label>
              </div>
              
              <button 
                onClick={handleUploadWork}
                disabled={savingWork}
                className="w-full py-3 bg-accent text-white font-bold rounded-xl hover:bg-orange-600 transition-colors mt-6 shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {savingWork ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
                อัปโหลดผลงาน
              </button>
            </div>
          </div>

        </div>

        {/* Right Column - Logs List & Supervision */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Teaching Logs List */}
          <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2 mb-6 flex items-center gap-2">
              <FileText size={20} /> บันทึกการสอนย้อนหลัง
            </h2>
            
            {teachingLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>ยังไม่มีบันทึกการสอน</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teachingLogs.map(log => (
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
                <div key={work.id} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={work.imageUrl} alt={work.title} className="w-full h-full object-cover" />
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
