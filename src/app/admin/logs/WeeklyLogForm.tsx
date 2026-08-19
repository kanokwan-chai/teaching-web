"use client";

import { useState, useEffect } from "react";
import { Save, Loader2, UploadCloud, X, CalendarOff } from "lucide-react";
import { uploadImage } from "@/lib/upload";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";

interface Activity {
  dayName: string;
  date: string;
  activity: string;
  isHoliday: boolean; // For backward compatibility
  leaveType?: "none" | "holiday" | "personal" | "sick";
  activityLink?: string;
}

const defaultDays = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์"];

const dayColors: Record<string, string> = {
  "จันทร์": "border-yellow-400 bg-yellow-50/50",
  "อังคาร": "border-pink-400 bg-pink-50/50",
  "พุธ": "border-green-400 bg-green-50/50",
  "พฤหัสบดี": "border-orange-400 bg-orange-50/50",
  "ศุกร์": "border-blue-400 bg-blue-50/50"
};

const dayHeaderColors: Record<string, string> = {
  "จันทร์": "text-yellow-600",
  "อังคาร": "text-pink-600",
  "พุธ": "text-green-600",
  "พฤหัสบดี": "text-orange-600",
  "ศุกร์": "text-blue-600"
};

export default function WeeklyLogForm({ onSaved, editLog, onCancelEdit }: { onSaved: () => void, editLog?: any, onCancelEdit?: () => void }) {
  const [saving, setSaving] = useState(false);
  const [weekNumber, setWeekNumber] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [term, setTerm] = useState(1);
  const [weekFiles, setWeekFiles] = useState<File[]>([]);
  const [weekImageUrls, setWeekImageUrls] = useState<string[]>([]);
  
  const [activities, setActivities] = useState<Activity[]>(
    defaultDays.map(day => ({ dayName: day, date: "", activity: "", isHoliday: false, leaveType: "none", activityLink: "" }))
  );

  useEffect(() => {
    if (editLog) {
      setWeekNumber(editLog.weekNumber.toString());
      setDateRange(editLog.dateRange);
      setTerm(editLog.term || 1);
      
      const existingUrls = editLog.imageUrls || (editLog.imageUrl ? [editLog.imageUrl] : []);
      setWeekImageUrls(existingUrls);
      setWeekFiles([]);
      
      const newActivities = defaultDays.map((day, index) => {
        const existingAct = editLog.activities[index] || {};
        return {
          dayName: day,
          date: existingAct.date || "",
          activity: existingAct.activity || "",
          isHoliday: existingAct.isHoliday || false,
          leaveType: existingAct.leaveType || (existingAct.isHoliday ? "holiday" : "none"),
          activityLink: existingAct.activityLink || "",
        };
      });
      setActivities(newActivities);
    } else {
      setWeekNumber("");
      setDateRange("");
      setTerm(1);
      setWeekImageUrls([]);
      setWeekFiles([]);
      setActivities(defaultDays.map(day => ({ dayName: day, date: "", activity: "", isHoliday: false, leaveType: "none", activityLink: "" })));
    }
  }, [editLog]);

  const updateActivity = (index: number, field: keyof Activity, value: any) => {
    setActivities(prev => {
      const newActivities = [...prev];
      newActivities[index] = { ...newActivities[index], [field]: value };
      return newActivities;
    });
  };

  const removeFile = (index: number) => {
    const newFiles = [...weekFiles];
    newFiles.splice(index, 1);
    setWeekFiles(newFiles);
  };

  const removeUrl = (index: number) => {
    const newUrls = [...weekImageUrls];
    newUrls.splice(index, 1);
    setWeekImageUrls(newUrls);
  };

  const handleSave = async () => {
    if (!weekNumber || !dateRange) {
      alert("กรุณากรอกสัปดาห์ที่และช่วงวันที่ให้ครบถ้วน");
      return;
    }

    setSaving(true);
    try {
      let finalImageUrls = [...weekImageUrls];
      
      if (weekFiles.length > 0) {
        const uploadedUrls = await Promise.all(weekFiles.map(file => uploadImage(file, `logs/term-${term}`)));
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      const logData = {
        weekNumber: Number(weekNumber),
        term: term,
        dateRange,
        imageUrls: finalImageUrls,
        imageUrl: finalImageUrls.length > 0 ? finalImageUrls[0] : "", // for backward compatibility
        activities: activities,
        updatedAt: new Date().toISOString()
      };

      if (editLog) {
        await updateDoc(doc(db, "teaching_logs", editLog.id), logData);
        alert("แก้ไขบันทึกการสอนสำเร็จ!");
        if (onCancelEdit) onCancelEdit();
      } else {
        await addDoc(collection(db, "teaching_logs"), {
          ...logData,
          createdAt: new Date().toISOString()
        });
        alert("บันทึกการสอนสำเร็จ!");
      }

      if (!editLog) {
        setWeekNumber("");
        setDateRange("");
        setTerm(1);
        setWeekFiles([]);
        setWeekImageUrls([]);
        setActivities(defaultDays.map(day => ({ dayName: day, date: "", activity: "", isHoliday: false, leaveType: "none", activityLink: "" })));
      }
      
      onSaved();
    } catch (error) {
      console.error("Error saving teaching log:", error);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass p-6 md:p-8 rounded-[2rem] border border-white/50 bg-white/40 shadow-sm">
      <div className="flex justify-between items-center border-b border-primary/20 pb-2 mb-6">
        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
          {editLog ? "แก้ไขบันทึกการสอนรายสัปดาห์" : "เพิ่มบันทึกการสอนรายสัปดาห์"}
        </h2>
        {editLog && onCancelEdit && (
          <button onClick={onCancelEdit} className="text-sm text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
            <X size={16} /> ยกเลิกการแก้ไข
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">ภาคเรียนที่</label>
          <select 
            value={term}
            onChange={(e) => setTerm(Number(e.target.value))}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value={1}>ภาคเรียนที่ 1</option>
            <option value={2}>ภาคเรียนที่ 2</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">สัปดาห์ที่</label>
          <input 
            type="number" 
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="เช่น 1" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-foreground mb-2">ช่วงวันที่</label>
          <input 
            type="text" 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full p-3 rounded-xl border border-gray-200 bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary/50" 
            placeholder="เช่น 5-9 พ.ค. 2026" 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
        {/* รูปภาพรวมประจำสัปดาห์ */}
        <div className="lg:col-span-1">
          <label className="block text-sm font-bold text-foreground mb-2">รูปภาพประกอบ (เลือกได้หลายรูป)</label>
          <label className={`w-full h-32 rounded-xl border-2 border-dashed border-gray-300 bg-white/30 flex flex-col items-center justify-center text-gray-500 hover:bg-white/50 hover:border-primary/50 transition-colors cursor-pointer mb-4`}>
            <input 
              type="file" 
              accept="image/*" 
              multiple
              className="hidden" 
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  setWeekFiles([...weekFiles, ...Array.from(e.target.files)]);
                }
              }} 
            />
            <UploadCloud size={32} className="mb-2 opacity-50" />
            <p className="text-sm font-medium">คลิกเพื่อเพิ่มรูปภาพ</p>
          </label>
          
          <div className="grid grid-cols-2 gap-2">
            {weekImageUrls.map((url, i) => (
              <div key={`url-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={url} alt={`Saved ${i}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeUrl(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {weekFiles.map((file, i) => (
              <div key={`file-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-primary/50">
                <img src={URL.createObjectURL(file)} alt={`New ${i}`} className="w-full h-full object-cover" />
                <button 
                  onClick={() => removeFile(i)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[10px] text-center py-0.5">ใหม่</div>
              </div>
            ))}
          </div>
        </div>

        {/* กิจกรรมรายวัน */}
        <div className="lg:col-span-2 space-y-4">
          <label className="block text-sm font-bold text-foreground">กิจกรรมรายวัน (จันทร์ - ศุกร์)</label>
          
          {activities.map((act, index) => {
            const isLeave = act.leaveType && act.leaveType !== "none";
            const borderColor = act.leaveType === "holiday" ? 'border-red-300' : act.leaveType === "personal" ? 'border-orange-300' : act.leaveType === "sick" ? 'border-purple-300' : dayColors[act.dayName];
            const headerColor = act.leaveType === "holiday" ? 'text-red-500' : act.leaveType === "personal" ? 'text-orange-500' : act.leaveType === "sick" ? 'text-purple-500' : dayHeaderColors[act.dayName];

            return (
              <div key={index} className={`p-4 rounded-xl border-2 flex flex-col md:flex-row gap-4 relative transition-all ${borderColor}`}>
                <div className="flex-shrink-0 w-full md:w-32 flex flex-col md:flex-col justify-between md:justify-start items-center md:items-start gap-2">
                  <span className={`font-bold text-lg ${headerColor}`}>
                    วัน{act.dayName}
                  </span>
                  
                  <div className="flex flex-col gap-1.5 w-full mt-1">
                    <button
                      onClick={() => {
                        updateActivity(index, "leaveType", act.leaveType === "holiday" ? "none" : "holiday");
                        updateActivity(index, "isHoliday", act.leaveType !== "holiday"); // for backward compatibility
                      }}
                      className={`text-xs px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 font-bold transition-colors shadow-sm w-full ${act.leaveType === "holiday" ? 'bg-red-500 text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      วันหยุด
                    </button>
                    <button
                      onClick={() => {
                        updateActivity(index, "leaveType", act.leaveType === "personal" ? "none" : "personal");
                        updateActivity(index, "isHoliday", act.leaveType !== "personal");
                      }}
                      className={`text-xs px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 font-bold transition-colors shadow-sm w-full ${act.leaveType === "personal" ? 'bg-orange-500 text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      ลากิจ
                    </button>
                    <button
                      onClick={() => {
                        updateActivity(index, "leaveType", act.leaveType === "sick" ? "none" : "sick");
                        updateActivity(index, "isHoliday", act.leaveType !== "sick");
                      }}
                      className={`text-xs px-2 py-1.5 rounded-lg flex items-center justify-center gap-1 font-bold transition-colors shadow-sm w-full ${act.leaveType === "sick" ? 'bg-purple-500 text-white border-transparent' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                      ลาป่วย
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  {!isLeave ? (
                    <div className="flex flex-col gap-3">
                      <input 
                        type="date" 
                        value={act.date}
                        onChange={(e) => updateActivity(index, "date", e.target.value)}
                        className="w-full md:w-auto p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/30 outline-none" 
                      />
                      <textarea 
                        value={act.activity}
                        onChange={(e) => updateActivity(index, "activity", e.target.value)}
                        className="w-full p-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/30 outline-none" 
                        placeholder="รายละเอียดการทำงาน..." 
                        rows={3}
                      />
                      <input 
                        type="url" 
                        value={act.activityLink || ""}
                        onChange={(e) => updateActivity(index, "activityLink", e.target.value)}
                        className="w-full p-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary/30 outline-none text-accent" 
                        placeholder="ลิงก์กิจกรรมการเรียนรู้/ผลงาน (ถ้ามี)..." 
                      />
                    </div>
                  ) : (
                    <div className={`py-2 flex flex-col md:flex-row items-center gap-3 ${act.leaveType === 'holiday' ? 'text-red-500/80' : act.leaveType === 'personal' ? 'text-orange-500/80' : 'text-purple-500/80'}`}>
                      <input 
                        type="date" 
                        value={act.date}
                        onChange={(e) => updateActivity(index, "date", e.target.value)}
                        className={`w-full md:w-auto p-2 text-sm rounded-lg border bg-white/50 text-center ${act.leaveType === 'holiday' ? 'border-red-200' : act.leaveType === 'personal' ? 'border-orange-200' : 'border-purple-200'}`} 
                      />
                      <p className="font-bold flex-1">
                        {act.leaveType === 'holiday' ? 'ไม่ได้บันทึกการสอน (วันหยุด)' : act.leaveType === 'personal' ? 'ลากิจ' : 'ลาป่วย'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button 
        onClick={handleSave}
        disabled={saving}
        className="w-full py-4 mt-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 text-lg"
      >
        {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
        {editLog ? "บันทึกการแก้ไข" : "บันทึกข้อมูลสัปดาห์นี้"}
      </button>
    </div>
  );
}
