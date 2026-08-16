"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, FileText, Trash2, Loader2, Save, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function AdminEvaluation() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    pdfUrl: "",
    term: 1,
  });

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const q = query(collection(db, "evaluations"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setEvaluations(data);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!formData.pdfUrl || !formData.title) {
      alert("กรุณากรอกข้อมูลและใส่ลิงก์ Google Drive ให้ครบถ้วน");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "evaluations"), {
        title: formData.title,
        filename: "ลิงก์ Google Drive",
        pdfUrl: formData.pdfUrl,
        term: formData.term,
        createdAt: new Date().toISOString()
      });

      alert("บันทึกแบบประเมินสำเร็จ!");
      setFormData({ title: "", pdfUrl: "", term: 1 });
      fetchEvaluations();
    } catch (error) {
      console.error("Error saving evaluation:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (evalId: string) => {
    if (!confirm("คุณต้องการลบแบบประเมินนี้ใช่หรือไม่?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "evaluations", evalId));
      fetchEvaluations();
    } catch (error) {
      console.error("Error deleting evaluation:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
      setLoading(false);
    }
  };

  if (loading && evaluations.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">แบบประเมิน (Evaluation)</h1>
          <p className="text-foreground/60">เพิ่มลิงก์แบบประเมินเพื่อนำไปพรีวิวแสดงผลในหน้าเว็บ</p>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2 mb-6">เพิ่มแบบประเมินใหม่</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ภาคเรียนที่</label>
              <select 
                value={formData.term}
                onChange={(e) => setFormData({...formData, term: Number(e.target.value)})}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4 font-medium"
              >
                <option value={1}>ภาคเรียนที่ 1 (เทอม 1)</option>
                <option value={2}>ภาคเรียนที่ 2 (เทอม 2)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ชื่อแบบประเมิน</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="เช่น แบบประเมินครั้งที่ 1" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ลิงก์ Google Drive (PDF)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="url" 
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({...formData, pdfUrl: e.target.value})}
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="วางลิงก์ Google Drive ของไฟล์ที่นี่..." 
                />
              </div>
              <p className="text-xs text-foreground/50 mt-2">อย่าลืมตั้งค่าลิงก์ใน Google Drive ให้เป็น "Anyone with the link"</p>
            </div>
            
            <button 
              onClick={handleUpload}
              disabled={saving}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors mt-6 shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? "กำลังอัปโหลด..." : "อัปโหลดและบันทึก"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-6">แบบประเมินทั้งหมด</h2>
          
          {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : evaluations.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-300">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีแบบประเมิน</p>
              <p className="text-sm mt-1">เพิ่มไฟล์ในฟอร์มด้านซ้าย</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {evaluations.map((evalItem) => {
                const isPreviewing = previewId === evalItem.id;

                return (
                  <div key={evalItem.id} className="glass p-5 rounded-2xl border border-white/50 bg-white/40 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                          {evalItem.title}
                          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 font-bold">
                            เทอม {evalItem.term || 1}
                          </span>
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <a href={evalItem.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                            <FileText size={14} />
                            เปิดดูไฟล์ PDF
                          </a>
                          <button
                            onClick={() => setPreviewId(isPreviewing ? null : evalItem.id)}
                            className="text-sm text-gray-600 hover:text-primary flex items-center gap-1 bg-white/60 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
                          >
                            {isPreviewing ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{isPreviewing ? "ซ่อนตัวอย่าง PDF" : "พรีวิวตัวอย่าง"}</span>
                          </button>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleDelete(evalItem.id)}
                        className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-200"
                        title="ลบไฟล์"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>

                    {isPreviewing && (
                      <div className="mt-4 pt-4 border-t border-gray-200/60">
                        <MediaPreview
                          pdfUrl={evalItem.pdfUrl}
                          pdfTitle="พรีวิวแบบประเมิน (PDF)"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

