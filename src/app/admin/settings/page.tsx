"use client";

import { useState, useEffect } from "react";
import { Save, Upload, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/upload";

export default function AdminSettingsDemo() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUhN1uL-eya-663hhr7ScHaMgwNUBFz0NXKPhQ74t1FA&s");
  const [formData, setFormData] = useState({
    name: "นางสาวกนกวรรณ ชัยชนะ",
    studentId: "6602041630012",
    faculty: "ครุศาสตร์อุตสาหกรรม",
    major: "เทคโนโลยีคอมพิวเตอร์",
    university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    term: "ภาคเรียนที่ 1 และ 2 ปีการศึกษา 2567",
    imageUrl: ""
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({ ...formData, ...docSnap.data() });
          if (docSnap.data().imageUrl) {
            setPreviewUrl(docSnap.data().imageUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      if (file) {
        finalImageUrl = await uploadImage(file, "profile");
      }

      await setDoc(doc(db, "settings", "profile"), {
        ...formData,
        imageUrl: finalImageUrl,
        updatedAt: new Date().toISOString()
      });

      alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">ข้อมูลส่วนตัว (Profile)</h1>
        <p className="text-foreground/60">จัดการข้อมูลส่วนตัว รูปโปรไฟล์ และข้อความหน้าแรก</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm flex flex-col items-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden mb-6 border-4 border-primary/20 bg-white shadow-inner">
              <img src={previewUrl} alt="Profile" className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white">
                <Upload size={24} className="mb-2" />
                <span className="text-sm font-medium">เปลี่ยนรูปภาพ</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            <p className="text-sm text-center text-foreground/60">
              คลิกที่รูปภาพเพื่ออัปโหลดรูปโปรไฟล์ใหม่<br />แนะนำขนาด 1:1 (สี่เหลี่ยมจัตุรัส)
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm space-y-6">
            <h2 className="text-xl font-bold text-primary border-b border-primary/20 pb-2 mb-4">ข้อมูลเบื้องต้น</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">ชื่อ-นามสกุล</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="เช่น นางสาวกนกวรรณ ชัยชนะ"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">รหัสนักศึกษา</label>
                <input 
                  type="text" 
                  name="studentId"
                  value={formData.studentId} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="เช่น 6602041630012"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">คณะ</label>
                <input 
                  type="text" 
                  name="faculty"
                  value={formData.faculty} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="เช่น ครุศาสตร์อุตสาหกรรม"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">สาขาวิชา</label>
                <input 
                  type="text" 
                  name="major"
                  value={formData.major} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="เช่น เทคโนโลยีคอมพิวเตอร์"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-foreground mb-2">มหาวิทยาลัย</label>
                <input 
                  type="text" 
                  name="university"
                  value={formData.university} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="เช่น มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">ภาคเรียนฝึกประสบการณ์</label>
                <input 
                  type="text" 
                  name="term"
                  value={formData.term} 
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="เช่น ภาคเรียนที่ 1 และ 2 ปีการศึกษา 2567"
                />
              </div>
            </div>
            
            <div className="pt-6 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
