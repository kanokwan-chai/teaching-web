"use client";

import { useState, useEffect } from "react";
import { Save, ImagePlus, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/upload";

export default function AdminSchool() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    name: "",
    address: "",
    director: "",
    mentor: "",
    imageUrl: "",
    logoUrl: "",
    orgChartUrl: ""
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [orgChartFile, setOrgChartFile] = useState<File | null>(null);
  
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string>("");
  const [orgChartPreviewUrl, setOrgChartPreviewUrl] = useState<string>("");

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const docRef = doc(db, "school", "info");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const fetchedData = docSnap.data() as any;
          setData({ ...data, ...fetchedData });
          if (fetchedData.imageUrl) setPreviewUrl(fetchedData.imageUrl);
          if (fetchedData.logoUrl) setLogoPreviewUrl(fetchedData.logoUrl);
          if (fetchedData.orgChartUrl) setOrgChartPreviewUrl(fetchedData.orgChartUrl);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchoolData();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'logo' | 'orgChart') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === 'image') {
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else if (type === 'logo') {
        setLogoFile(file);
        setLogoPreviewUrl(URL.createObjectURL(file));
      } else if (type === 'orgChart') {
        setOrgChartFile(file);
        setOrgChartPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let updatedData = { ...data };

      // Upload main image
      if (imageFile) {
        updatedData.imageUrl = await uploadImage(imageFile);
      }

      // Upload logo
      if (logoFile) {
        updatedData.logoUrl = await uploadImage(logoFile);
      }

      // Upload org chart
      if (orgChartFile) {
        updatedData.orgChartUrl = await uploadImage(orgChartFile);
      }

      await setDoc(doc(db, "school", "info"), updatedData);
      setData(updatedData);
      alert("บันทึกข้อมูลสำเร็จ!");
    } catch (error) {
      console.error("Error saving data:", error);
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
        <h1 className="text-3xl font-bold text-foreground mb-2">ข้อมูลโรงเรียน (School Info)</h1>
        <p className="text-foreground/60">จัดการข้อมูลสถานศึกษา โลโก้ และแผนผังองค์กร</p>
      </header>

      <div className="glass p-6 md:p-8 rounded-2xl border border-white/50 bg-white/40 shadow-sm max-w-4xl">
        <div className="space-y-6 mb-8">
          
          <div className="flex gap-6 items-start">
            <div className="w-32 flex-shrink-0">
              <label className="block text-sm font-medium text-foreground/70 mb-2">โลโก้สถานศึกษา</label>
              <label className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 bg-white/30 flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'logo')} />
                {logoPreviewUrl ? (
                  <img src={logoPreviewUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <ImagePlus size={24} className="mb-2" />
                    <span className="text-xs">อัปโหลดโลโก้</span>
                  </>
                )}
              </label>
            </div>
            
            <div className="flex-1 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1">ชื่อสถานศึกษา</label>
                <input 
                  type="text" 
                  className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  placeholder="วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี" 
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">ชื่อผู้อำนวยการ</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    value={data.director}
                    onChange={(e) => setData({ ...data, director: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground/70 mb-1">ชื่อครูพี่เลี้ยง</label>
                  <input 
                    type="text" 
                    className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
                    value={data.mentor}
                    onChange={(e) => setData({ ...data, mentor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1">ที่อยู่สถานศึกษา</label>
            <textarea 
              className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50 h-20" 
              value={data.address}
              onChange={(e) => setData({ ...data, address: e.target.value })}
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">รูปภาพหน้าสถานศึกษา</label>
              <label className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 bg-white/30 flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'image')} />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <>
                    <ImagePlus size={32} className="mb-2" />
                    <p>คลิกเพื่ออัปโหลดรูปภาพ</p>
                  </>
                )}
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-2">แผนผังองค์กร (Organizational Chart)</label>
              <label className="w-full h-48 rounded-xl border-2 border-dashed border-gray-300 bg-white/30 flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'orgChart')} />
                {orgChartPreviewUrl ? (
                  <img src={orgChartPreviewUrl} alt="Org Chart" className="w-full h-full object-contain p-2" />
                ) : (
                  <>
                    <ImagePlus size={32} className="mb-2" />
                    <p>คลิกเพื่ออัปโหลดแผนผังองค์กร</p>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 border-t border-gray-200 pt-6">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {saving ? "กำลังบันทึก..." : "บันทึกข้อมูลสถานศึกษา"}
          </button>
        </div>
      </div>
    </div>
  );
}
