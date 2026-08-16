"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, FileText, Trash2, Loader2, Save, Pencil, X, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function AdminResearch() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [researches, setResearches] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    pdfUrl: "",
    workLink: "",
  });

  useEffect(() => {
    fetchResearches();
  }, []);

  const fetchResearches = async () => {
    try {
      const q = query(collection(db, "researches"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setResearches(data);
    } catch (error) {
      console.error("Error fetching researches:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ title: "", pdfUrl: "", workLink: "" });
  };

  const handleEditClick = (resItem: any) => {
    setEditingId(resItem.id);
    setFormData({
      title: resItem.title || "",
      pdfUrl: resItem.pdfUrl || "",
      workLink: resItem.workLink || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!formData.pdfUrl || !formData.title) {
      alert("กรุณากรอกข้อมูลและใส่ลิงก์ Google Drive ให้ครบถ้วน");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "researches", editingId), {
          title: formData.title,
          filename: "ลิงก์ Google Drive",
          pdfUrl: formData.pdfUrl,
          workLink: formData.workLink,
          updatedAt: new Date().toISOString()
        });
        alert("อัปเดตข้อมูลวิจัยในชั้นเรียนสำเร็จ!");
      } else {
        await addDoc(collection(db, "researches"), {
          title: formData.title,
          filename: "ลิงก์ Google Drive",
          pdfUrl: formData.pdfUrl,
          workLink: formData.workLink,
          createdAt: new Date().toISOString()
        });
        alert("บันทึกวิจัยในชั้นเรียนสำเร็จ!");
      }

      resetForm();
      fetchResearches();
    } catch (error) {
      console.error("Error saving research:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (resId: string) => {
    if (!confirm("คุณต้องการลบวิจัยนี้ใช่หรือไม่?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "researches", resId));
      if (editingId === resId) resetForm();
      fetchResearches();
    } catch (error) {
      console.error("Error deleting research:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
      setLoading(false);
    }
  };

  if (loading && researches.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">วิจัยในชั้นเรียน (Classroom Research)</h1>
          <p className="text-foreground/60">เพิ่มลิงก์วิจัยในชั้นเรียน เพื่อนำไปพรีวิวแสดงผลในหน้าเว็บ</p>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-primary/20 pb-2 mb-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              {editingId ? <Pencil size={22} /> : <FileText size={22} />}
              {editingId ? "แก้ไขวิจัยในชั้นเรียน" : "เพิ่มวิจัยใหม่"}
            </h2>
            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs bg-gray-200 hover:bg-gray-300 px-2.5 py-1 rounded-lg text-gray-700 font-semibold flex items-center gap-1 transition-colors"
              >
                <X size={14} />
                ยกเลิก
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ชื่องานวิจัย</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="เช่น การพัฒนาผลสัมฤทธิ์ทางการเรียน..." 
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
            
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ลิงก์ชิ้นงาน (ถ้ามี)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="url" 
                  value={formData.workLink}
                  onChange={(e) => setFormData({...formData, workLink: e.target.value})}
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="วางลิงก์ผลงานที่นี่..." 
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-md flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "กำลังบันทึก..." : editingId ? "บันทึกการแก้ไข" : "อัปโหลดและบันทึก"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  type="button"
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </div>
        </div>

        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold mb-6">วิจัยในชั้นเรียนทั้งหมด ({researches.length})</h2>
          
          {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : researches.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-300">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีวิจัยในชั้นเรียน</p>
              <p className="text-sm mt-1">เพิ่มไฟล์ในฟอร์มด้านซ้าย</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {researches.map((resItem) => {
                const isEditingThis = editingId === resItem.id;
                const isPreviewing = previewId === resItem.id;

                return (
                  <div key={resItem.id} className={`glass p-5 rounded-2xl border transition-all ${isEditingThis ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-white/50 bg-white/40 hover:border-primary/30 hover:shadow-md"}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{resItem.title}</h3>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <a href={resItem.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                            <FileText size={14} />
                            เปิดดูไฟล์ PDF
                          </a>
                          {resItem.workLink && (
                            <a href={resItem.workLink} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1 font-medium">
                              <LinkIcon size={14} />
                              ลิงก์ชิ้นงาน
                            </a>
                          )}
                          <button
                            onClick={() => setPreviewId(isPreviewing ? null : resItem.id)}
                            className="text-sm text-gray-600 hover:text-primary flex items-center gap-1 bg-white/60 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
                          >
                            {isPreviewing ? <EyeOff size={14} /> : <Eye size={14} />}
                            <span>{isPreviewing ? "ซ่อนตัวอย่าง PDF" : "พรีวิวตัวอย่าง"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button 
                          onClick={() => handleEditClick(resItem)}
                          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-transparent hover:border-blue-200 flex items-center gap-1 text-sm font-semibold"
                          title="แก้ไขข้อมูล"
                        >
                          <Pencil size={18} />
                          <span className="hidden sm:inline">แก้ไข</span>
                        </button>

                        <button 
                          onClick={() => handleDelete(resItem.id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-200"
                          title="ลบไฟล์"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {isPreviewing && (
                      <div className="mt-4 pt-4 border-t border-gray-200/60">
                        <MediaPreview
                          pdfUrl={resItem.pdfUrl}
                          pdfTitle="พรีวิววิจัย (PDF)"
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

