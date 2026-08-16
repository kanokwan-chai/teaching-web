"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, FileText, Trash2, Loader2, Save, UserCheck, BookOpen, Eye, EyeOff } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import MediaPreview from "@/components/MediaPreview";

export default function AdminLessons() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [selectedTermFilter, setSelectedTermFilter] = useState<"all" | "1" | "2">("all");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    term: "1",
    subject: "",
    mentorTeacher: "",
    title: "",
    pdfUrl: "",
    workLink: "",
  });

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const q = query(collection(db, "lessons"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const data: any[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setLessons(data);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!formData.pdfUrl || !formData.title || !formData.subject) {
      alert("กรุณากรอกข้อมูล วิชา, ชื่อแผนการสอน/เรื่อง และใส่ลิงก์ Google Drive ให้ครบถ้วน");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, "lessons"), {
        term: Number(formData.term) || 1,
        subject: formData.subject,
        mentorTeacher: formData.mentorTeacher,
        title: formData.title,
        filename: "ลิงก์ Google Drive",
        pdfUrl: formData.pdfUrl,
        workLink: formData.workLink || "",
        createdAt: new Date().toISOString()
      });

      alert("บันทึกแผนการสอนสำเร็จ!");
      setFormData({
        term: "1",
        subject: "",
        mentorTeacher: "",
        title: "",
        pdfUrl: "",
        workLink: "",
      });
      fetchLessons();
    } catch (error) {
      console.error("Error saving lesson:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    if (!confirm("คุณต้องการลบแผนการสอนนี้ใช่หรือไม่?")) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, "lessons", lessonId));
      fetchLessons();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("เกิดข้อผิดพลาดในการลบ");
      setLoading(false);
    }
  };

  const filteredLessons = lessons.filter((lesson) => {
    if (selectedTermFilter === "all") return true;
    const lessonTerm = String(lesson.term || 1);
    return lessonTerm === selectedTermFilter;
  });

  if (loading && lessons.length === 0) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">แผนการสอน (Lesson Plans)</h1>
          <p className="text-foreground/60">จัดการแผนการเรียนรู้ แยกตามเทอม และครูพี่เลี้ยงประจำวิชา พร้อมระบบพรีวิว PDF</p>
        </header>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm h-fit">
          <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2 mb-6 flex items-center gap-2">
            <BookOpen size={22} />
            เพิ่มแผนการสอนใหม่
          </h2>
          <div className="space-y-4">
            {/* Term selection */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ภาคเรียน / เทอม</label>
              <select
                value={formData.term}
                onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/70 focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
              >
                <option value="1">ภาคเรียนที่ 1 (เทอม 1)</option>
                <option value="2">ภาคเรียนที่ 2 (เทอม 2)</option>
              </select>
            </div>

            {/* Subject name */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ชื่อวิชา</label>
              <input 
                type="text" 
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="เช่น วิทยาการคำนวณ, เทคโนโลยีสารสนเทศ" 
              />
            </div>

            {/* Mentor Teacher */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ครูพี่เลี้ยงประจำวิชา</label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  value={formData.mentorTeacher}
                  onChange={(e) => setFormData({ ...formData, mentorTeacher: e.target.value })}
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="เช่น ครูสมชาย ใจดี" 
                />
              </div>
            </div>

            {/* Title / Topic */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ชื่อแผนการสอน / เรื่อง</label>
              <input 
                type="text" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                placeholder="เช่น การเขียนโปรแกรมเบื้องต้นด้วย Scratch" 
              />
            </div>

            {/* Google Drive PDF URL */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ลิงก์ Google Drive (PDF แผนการสอน)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="url" 
                  value={formData.pdfUrl}
                  onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="วางลิงก์ Google Drive ของไฟล์ PDF..." 
                />
              </div>
              <p className="text-xs text-foreground/50 mt-1.5">อย่าลืมตั้งค่าลิงก์ใน Google Drive ให้เป็น "Anyone with the link"</p>
            </div>

            {/* Work Link (Optional) */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">ลิงก์ชิ้นงาน / ผลงาน / สื่อการสอน (ถ้ามี)</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-3.5 text-gray-400" size={18} />
                <input 
                  type="url" 
                  value={formData.workLink}
                  onChange={(e) => setFormData({ ...formData, workLink: e.target.value })}
                  className="w-full pl-10 p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="วางลิงก์ผลงาน หรือ สื่อการสอน..." 
                />
              </div>
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

        {/* Lessons List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-bold">ไฟล์แผนการสอนทั้งหมด ({filteredLessons.length})</h2>
            
            {/* Term Filter Bar */}
            <div className="flex items-center gap-2 p-1 bg-white/60 rounded-xl border border-gray-200/60 glass text-sm font-semibold">
              <button
                onClick={() => setSelectedTermFilter("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedTermFilter === "all" ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-foreground"
                }`}
              >
                ทั้งหมด ({lessons.length})
              </button>
              <button
                onClick={() => setSelectedTermFilter("1")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedTermFilter === "1" ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-foreground"
                }`}
              >
                เทอม 1 ({lessons.filter(l => (l.term || 1) === 1 || l.term === "1").length})
              </button>
              <button
                onClick={() => setSelectedTermFilter("2")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedTermFilter === "2" ? "bg-primary text-white shadow-sm" : "text-gray-600 hover:text-foreground"
                }`}
              >
                เทอม 2 ({lessons.filter(l => (l.term || 1) === 2 || l.term === "2").length})
              </button>
            </div>
          </div>
          
          {loading ? (
             <div className="flex justify-center items-center py-12">
               <Loader2 className="animate-spin text-primary" size={32} />
             </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-300">
              <FileText size={48} className="mx-auto mb-3 opacity-50" />
              <p>ยังไม่มีไฟล์แผนการสอน{selectedTermFilter !== "all" ? ` ในเทอม ${selectedTermFilter}` : ""}</p>
              <p className="text-sm mt-1">เพิ่มไฟล์ในฟอร์มด้านซ้าย</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredLessons.map((lesson, idx) => {
                const termNum = lesson.term || 1;
                const isPreviewing = previewId === lesson.id;

                return (
                  <div key={lesson.id} className="glass p-5 rounded-2xl border border-white/50 bg-white/40 hover:border-primary/30 hover:shadow-md transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 bg-primary/15 text-primary text-xs font-bold rounded-md">
                            เทอม {termNum}
                          </span>
                          {lesson.subject && (
                            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md flex items-center gap-1">
                              <BookOpen size={12} />
                              {lesson.subject}
                            </span>
                          )}
                          {lesson.mentorTeacher && (
                            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-md flex items-center gap-1">
                              <UserCheck size={12} />
                              ครูพี่เลี้ยง: {lesson.mentorTeacher}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-lg text-foreground">{lesson.title}</h3>
                        <div className="flex flex-wrap items-center gap-4 mt-2">
                            <a href={lesson.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium">
                              <FileText size={14} />
                              เปิดลิงก์ PDF
                            </a>
                            {lesson.workLink && (
                              <a href={lesson.workLink} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline flex items-center gap-1 font-medium">
                                <LinkIcon size={14} />
                                ลิงก์ชิ้นงาน
                              </a>
                            )}
                            <button
                              onClick={() => setPreviewId(isPreviewing ? null : lesson.id)}
                              className="text-sm text-gray-600 hover:text-primary flex items-center gap-1 bg-white/60 px-2.5 py-1 rounded-lg border border-gray-200 transition-colors"
                            >
                              {isPreviewing ? <EyeOff size={14} /> : <Eye size={14} />}
                              <span>{isPreviewing ? "ซ่อนตัวอย่าง PDF" : "พรีวิวตัวอย่าง"}</span>
                            </button>
                          </div>
                        </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button 
                          onClick={() => handleDelete(lesson.id)}
                          className="p-3 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors border border-transparent hover:border-red-200"
                          title="ลบไฟล์"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </div>

                    {/* Inline Preview Toggle inside Admin */}
                    {isPreviewing && (
                      <div className="mt-4 pt-4 border-t border-gray-200/60">
                        <MediaPreview
                          pdfUrl={lesson.pdfUrl}
                          workLink={lesson.workLink}
                          pdfTitle="พรีวิวแผนการสอน (PDF)"
                          workTitle="พรีวิวชิ้นงาน/สื่อ"
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


