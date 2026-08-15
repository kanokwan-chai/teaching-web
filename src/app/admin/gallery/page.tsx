"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadToImgBB } from "@/lib/imgbb";

type GalleryImage = {
  id: string;
  url: string;
  term: number;
};

export default function AdminGallery() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const docRef = doc(db, "gallery", "images");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setImages(docSnap.data().items || []);
        }
      } catch (error) {
        console.error("Error fetching gallery:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setSaving(true);
    try {
      const files = Array.from(e.target.files);
      // Upload all files in parallel via ImgBB
      const uploadPromises = files.map(async (file, i) => {
        const imageId = `${Date.now()}_${i}`;
        const url = await uploadToImgBB(file);
        return { id: imageId, url, term: selectedTerm };
      });

      const newImages = await Promise.all(uploadPromises);

      const updatedImages = [...images, ...newImages];
      
      await setDoc(doc(db, "gallery", "images"), { items: updatedImages });
      setImages(updatedImages);
      
      alert(`อัปโหลดสำเร็จ ${files.length} รูปภาพ!`);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ");
    } finally {
      setSaving(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("คุณต้องการลบรูปภาพนี้ใช่หรือไม่?")) return;
    
    setSaving(true);
    try {
      const updatedImages = images.filter(img => img.id !== id);
      await setDoc(doc(db, "gallery", "images"), { items: updatedImages });
      setImages(updatedImages);
    } catch (error) {
      console.error("Error deleting image:", error);
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

  const term1Images = images.filter(img => img.term === 1);
  const term2Images = images.filter(img => img.term === 2);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">แกลเลอรีรูปภาพ (Gallery)</h1>
        <p className="text-foreground/60">อัปโหลดและจัดการรูปภาพกิจกรรมในแต่ละภาคเรียน</p>
      </header>

      <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold">อัปโหลดรูปภาพใหม่</h2>
            <select 
              className="p-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(Number(e.target.value))}
            >
              <option value={1}>เพิ่มในภาคเรียนที่ 1</option>
              <option value={2}>เพิ่มในภาคเรียนที่ 2</option>
            </select>
          </div>
          
          <label className={`px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md cursor-pointer ${saving ? 'opacity-50 pointer-events-none' : ''}`}>
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {saving ? "กำลังอัปโหลด..." : "เลือกรูปภาพ"}
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={saving} />
          </label>
        </div>
      </div>

      <div className="space-y-8">
        {/* Term 1 */}
        <div>
          <h3 className="text-xl font-bold text-primary mb-4 border-b border-primary/20 pb-2">รูปภาพภาคเรียนที่ 1</h3>
          {term1Images.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-300">
              <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
              <p>ยังไม่มีรูปภาพในภาคเรียนที่ 1</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {term1Images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Term 2 */}
        <div>
          <h3 className="text-xl font-bold text-accent mb-4 border-b border-accent/20 pb-2">รูปภาพภาคเรียนที่ 2</h3>
          {term2Images.length === 0 ? (
            <div className="text-center py-8 text-gray-400 bg-white/30 rounded-xl border border-dashed border-gray-300">
              <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
              <p>ยังไม่มีรูปภาพในภาคเรียนที่ 2</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {term2Images.map((img) => (
                <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                  <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => handleDelete(img.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
