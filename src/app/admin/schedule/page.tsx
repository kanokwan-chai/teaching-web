"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Loader2, Save } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";

export default function AdminSchedule() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [scheduleImages, setScheduleImages] = useState<{id: string, url: string, term: number}[]>([]);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const docSnap = await getDoc(doc(db, "school", "schedule"));
      if (docSnap.exists()) {
        setScheduleImages(docSnap.data().images || []);
      }
    } catch (error) {
      console.error("Error fetching schedule:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setSaving(true);
    try {
      const files = Array.from(e.target.files);
      const newImages = [...scheduleImages];
      
      for (let i = 0; i < files.length; i++) {
        const url = await uploadToImgBB(files[i]);
        newImages.push({
          id: `${Date.now()}_${i}`,
          url,
          term: selectedTerm
        });
      }
      
      await setDoc(doc(db, "school", "schedule"), { images: newImages });
      setScheduleImages(newImages);
      alert("อัปโหลดรูปตารางสอนสำเร็จ!");
    } catch (error) {
      console.error("Error uploading schedule:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (idToDelete: string) => {
    if (!confirm("คุณต้องการลบรูปตารางสอนนี้ใช่หรือไม่?")) return;
    
    setSaving(true);
    try {
      const newImages = scheduleImages.filter(img => img.id !== idToDelete);
      await setDoc(doc(db, "school", "schedule"), { images: newImages });
      setScheduleImages(newImages);
    } catch (error) {
      console.error("Error deleting schedule:", error);
      alert("เกิดข้อผิดพลาดในการลบรูปภาพ");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
          <h1 className="text-3xl font-bold text-foreground mb-2">ตารางสอน (Teaching Schedule)</h1>
          <p className="text-foreground/60">อัปโหลดรูปภาพตารางสอนของคุณ (รองรับหลายรูป จะแสดงผลแบบเลื่อนสไลด์สวยๆ)</p>
        </header>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setSelectedTerm(1)}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedTerm === 1 ? 'bg-primary text-white shadow-md' : 'bg-white/50 text-foreground/60 hover:bg-white/80'}`}
        >
          ภาคเรียนที่ 1
        </button>
        <button 
          onClick={() => setSelectedTerm(2)}
          className={`flex-1 py-3 rounded-xl font-bold transition-all ${selectedTerm === 2 ? 'bg-accent text-white shadow-md' : 'bg-white/50 text-foreground/60 hover:bg-white/80'}`}
        >
          ภาคเรียนที่ 2
        </button>
      </div>

      <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm mb-8">
        <label className={`w-full h-40 rounded-xl border-2 border-dashed ${selectedTerm === 1 ? 'border-primary/50 bg-primary/5 text-primary hover:bg-primary/10' : 'border-accent/50 bg-accent/5 text-accent hover:bg-accent/10'} flex flex-col items-center justify-center transition-colors cursor-pointer relative overflow-hidden`}>
          <input 
            type="file" 
            accept="image/*" 
            multiple 
            className="hidden" 
            onChange={handleUpload} 
            disabled={saving}
          />
          {saving ? (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="font-bold">กำลังอัปโหลดรูปภาพ...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload size={32} className="mb-2" />
              <p className="font-bold text-lg">คลิกเพื่ออัปโหลดรูปตารางสอน (เทอม {selectedTerm})</p>
              <p className="text-sm opacity-70">สามารถเลือกพร้อมกันได้หลายรูป</p>
            </div>
          )}
        </label>
      </div>

      <h2 className="text-xl font-bold mb-4">รูปภาพตารางสอน (เทอม {selectedTerm})</h2>
      {scheduleImages.filter(img => img.term === selectedTerm).length === 0 ? (
        <div className="text-center py-12 bg-white/30 rounded-xl border border-dashed border-gray-300">
          <p className="text-gray-500">ยังไม่มีรูปภาพตารางสอนในภาคเรียนนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduleImages.filter(img => img.term === selectedTerm).map((img) => (
            <div key={img.id} className="relative group rounded-xl overflow-hidden shadow-md border border-white/50 bg-white/50">
              <img 
                src={img.url} 
                alt="Schedule" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => handleDelete(img.id)}
                  disabled={saving}
                  className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform hover:scale-110 shadow-lg"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
