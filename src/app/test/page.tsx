"use client";
import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";

export default function FirebaseTest() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

  const testFirestore = async () => {
    addLog("Testing Firestore...");
    try {
      await addDoc(collection(db, "test"), { time: new Date().toISOString() });
      addLog("✅ Firestore Success!");
    } catch (e: any) {
      addLog("❌ Firestore Error: " + e.message);
    }
  };

  const testStorage = async () => {
    addLog("Testing Storage...");
    try {
      const storageRef = ref(storage, "test.txt");
      const blob = new Blob(["test content"], { type: "text/plain" });
      await uploadBytes(storageRef, blob);
      addLog("✅ Storage Success!");
    } catch (e: any) {
      addLog("❌ Storage Error: " + e.message);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="flex gap-4 mb-8">
        <button onClick={testFirestore} className="px-4 py-2 bg-blue-500 text-white rounded">Test Database</button>
        <button onClick={testStorage} className="px-4 py-2 bg-green-500 text-white rounded">Test Storage (Image Uploads)</button>
      </div>

      <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto font-mono text-sm">
        {logs.map((log, i) => <div key={i}>{log}</div>)}
        {logs.length === 0 && <div className="text-gray-400">Click buttons above to test...</div>}
      </div>
    </div>
  );
}
