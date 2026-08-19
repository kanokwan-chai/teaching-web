"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, UploadCloud, FileText } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { uploadImage } from "@/lib/upload";

interface SupRecord {
  date: string;
  subject: string;
  teacher: string;
  imageUrl: string;
  file: File | null;
}

interface TermSupervision {
  onsite: SupRecord;
  online1: SupRecord;
  online2: SupRecord;
}

const emptyRecord: SupRecord = { date: "", subject: "", teacher: "", imageUrl: "", file: null };

export default function SupervisionForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTerm, setActiveTerm] = useState<1 | 2>(1);
  
  const [data, setData] = useState<{term1: TermSupervision, term2: TermSupervision}>({
    term1: { onsite: { ...emptyRecord }, online1: { ...emptyRecord }, online2: { ...emptyRecord } },
    term2: { onsite: { ...emptyRecord }, online1: { ...emptyRecord }, online2: { ...emptyRecord } }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const supRef = doc(db, "settings", "supervision_terms");
      const supSnap = await getDoc(supRef);
      if (supSnap.exists()) {
        const d = supSnap.data();
        setData({
          term1: d.term1 || { onsite: { ...emptyRecord }, online1: { ...emptyRecord }, online2: { ...emptyRecord } },
          term2: d.term2 || { onsite: { ...emptyRecord }, online1: { ...emptyRecord }, online2: { ...emptyRecord } }
        });
      } else {
        // Fallback to old data structure
        const oldRef = doc(db, "settings", "supervision");
        const oldSnap = await getDoc(oldRef);
        if (oldSnap.exists()) {
          const oldData = oldSnap.data();
          setData(prev => ({
            ...prev,
            term1: {
              onsite: { ...emptyRecord, ...oldData.onsite },
              online1: { ...emptyRecord, ...oldData.online1 },
              online2: { ...emptyRecord, ...oldData.online2 }
            }
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching supervision:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (type: "onsite" | "online1" | "online2", field: keyof SupRecord, value: any) => {
    setData(prev => {
      const termKey = `term${activeTerm}` as "term1" | "term2";
      return {
        ...prev,
        [termKey]: {
          ...prev[termKey],
          [type]: {
            ...prev[termKey][type],
            [field]: value
          }
        }
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const processRecord = async (record: SupRecord) => {
        let uploadedUrl = record.imageUrl;
        if (record.file) {
          uploadedUrl = await uploadImage(record.file, "logs/supervision");
        }
        return {
          date: record.date || "",
          subject: record.subject || "",
          teacher: record.teacher || "",
          imageUrl: uploadedUrl || ""
        };
      };

      const term1Data = {
        onsite: await processRecord(data.term1.onsite),
        online1: await processRecord(data.term1.online1),
        online2: await processRecord(data.term1.online2),
      };

      const term2Data = {
        onsite: await processRecord(data.term2.onsite),
        online1: await processRecord(data.term2.online1),
        online2: await processRecord(data.term2.online2),
      };

      await setDoc(doc(db, "settings", "supervision_terms"), {
        term1: term1Data,
        term2: term2Data,
        updatedAt: new Date().toISOString()
      });

      setData(prev => ({
        term1: {
          onsite: { ...prev.term1.onsite, file: null, imageUrl: term1Data.onsite.imageUrl },
          online1: { ...prev.term1.online1, file: null, imageUrl: term1Data.online1.imageUrl },
          online2: { ...prev.term1.online2, file: null, imageUrl: term1Data.online2.imageUrl }
        },
        term2: {
          onsite: { ...prev.term2.onsite, file: null, imageUrl: term2Data.onsite.imageUrl },
          online1: { ...prev.term2.online1, file: null, imageUrl: term2Data.online1.imageUrl },
          online2: { ...prev.term2.online2, file: null, imageUrl: term2Data.online2.imageUrl }
        }
      }));

      alert("บันทึกข้อมูลการนิเทศเรียบร้อยแล้ว!");
    } catch (error) {
      console.error("Error saving supervision:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const currentTermData = activeTerm === 1 ? data.term1 : data.term2;

  const renderCard = (title: string, type: "onsite" | "online1" | "online2", colorClass: string) => {
    const record = currentTermData[type];
    
    return (
      <div className={`space-y-3 bg-white/50 p-4 rounded-xl border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow`}>
        <h3 className={`font-bold ${colorClass}`}>{title}</h3>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">วันที่นิเทศ</label>
          <input type="text" value={record.date} onChange={(e) => handleChange(type, "date", e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="เช่น 15 ส.ค. 2026" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">วิชาที่สอน</label>
          <input type="text" value={record.subject} onChange={(e) => handleChange(type, "subject", e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="เช่น วิทยาการคำนวณ" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">อาจารย์ที่นิเทศ</label>
          <input type="text" value={record.teacher} onChange={(e) => handleChange(type, "teacher", e.target.value)} className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/50 focus:outline-none" placeholder="ชื่ออาจารย์..." />
        </div>
        <div className="flex-1 flex flex-col mt-2">
          <label className="block text-xs font-bold text-foreground mb-1">รูปภาพประกอบ</label>
          <label className={`w-full mt-auto min-h-[120px] rounded-xl border-2 border-dashed ${record.file || record.imageUrl ? 'border-primary bg-primary/5' : 'border-gray-300 bg-white/30'} flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 hover:border-primary/50 transition-colors cursor-pointer relative overflow-hidden group`}>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleChange(type, "file", e.target.files[0]);
                }
              }} 
            />
            {record.file ? (
              <img src={URL.createObjectURL(record.file)} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            ) : record.imageUrl ? (
              <img src={record.imageUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
            ) : (
              <>
                <UploadCloud size={24} className="mb-2" />
                <p className="text-xs">อัปโหลดรูปภาพ</p>
              </>
            )}
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm">
      <div className="flex flex-col md:flex-row justify-between md:items-center border-b border-primary/20 pb-4 mb-6 gap-4">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          <FileText size={20} /> ข้อมูลการนิเทศ
        </h2>
        <div className="flex bg-white/50 p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
          <button 
            onClick={() => setActiveTerm(1)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTerm === 1 ? "bg-primary text-white shadow-md" : "text-foreground/60 hover:bg-white hover:text-foreground"}`}
          >
            ภาคเรียนที่ 1
          </button>
          <button 
            onClick={() => setActiveTerm(2)}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTerm === 2 ? "bg-primary text-white shadow-md" : "text-foreground/60 hover:bg-white hover:text-foreground"}`}
          >
            ภาคเรียนที่ 2
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {renderCard("1. การนิเทศ On-site", "onsite", "text-accent")}
        {renderCard("2. การนิเทศ Online (ครั้งที่ 1)", "online1", "text-blue-500")}
        {renderCard("3. การนิเทศ Online (ครั้งที่ 2)", "online2", "text-blue-500")}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          บันทึกข้อมูลการนิเทศ
        </button>
      </div>
    </div>
  );
}
