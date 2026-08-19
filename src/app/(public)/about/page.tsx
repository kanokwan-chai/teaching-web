"use client";

import { useState, useEffect } from "react";
import { Loader2, Sparkles, Star } from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let localProfUrl = "";
        const profRes = await fetch("/api/local-images?folder=profile");
        const profData = await profRes.json();
        if (profData.images && profData.images.length > 0) {
          localProfUrl = profData.images[0].url;
        }

        const docRef = doc(db, "settings", "profile");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dbData = docSnap.data();
          setProfile({ ...dbData, imageUrl: localProfUrl || dbData.imageUrl });
        } else if (localProfUrl) {
          setProfile({ imageUrl: localProfUrl, name: "นางสาวกนกวรรณ ชัยชนะ" });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="glass rounded-[3rem] p-8 md:p-16 border border-white/50 bg-white/40 shadow-xl overflow-hidden relative"
      >
        {/* Background Decorations */}
        <div className="absolute top-10 right-10 text-yellow-400 opacity-50"><Star size={40} fill="currentColor" /></div>
        <div className="absolute bottom-20 right-20 text-blue-300 opacity-50"><Sparkles size={30} /></div>
        <div className="absolute top-20 left-1/2 text-pink-300 opacity-50"><Star size={24} fill="currentColor" /></div>

        <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
          
          {/* Avatar Section */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            className="w-64 h-64 md:w-80 md:h-80 flex-shrink-0"
          >
            <div className="w-full h-full rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl rotate-[-3deg] hover:rotate-0 transition-all duration-500">
              <img 
                src={profile.imageUrl || ""} 
                alt="Creator" 
                className="w-full h-full object-cover bg-gray-100"
              />
            </div>
          </motion.div>

          {/* Info Section */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-8"
            >
              <h2 className="text-3xl md:text-4xl font-extrabold text-blue-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                <Sparkles className="text-yellow-400" />
                จัดทำโดย
                <Sparkles className="text-pink-400" />
              </h2>
              
              <div className="inline-block px-8 py-4 bg-orange-200/60 rounded-full shadow-sm border border-orange-300/30">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  {profile.name}
                </h1>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3 text-lg md:text-xl font-medium text-blue-500/80 bg-white/50 p-8 rounded-3xl border border-white/60 shadow-sm w-full"
            >
              <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-blue-400 font-bold w-32">รหัสนักศึกษา :</span>
                <span className="text-gray-700">{profile.studentId || "-"}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-blue-400 font-bold w-32">คณะ :</span>
                <span className="text-gray-700">{profile.faculty || "-"}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="text-blue-400 font-bold w-32">สาขาวิชา :</span>
                <span className="text-gray-700">{profile.major || "-"}</span>
              </p>
              <p className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4 pt-4 border-t border-blue-200/30">
                <span className="text-gray-700 font-bold">{profile.university || "-"}</span>
              </p>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </div>
  );
}
