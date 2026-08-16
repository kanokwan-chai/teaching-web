"use client";

import { useState } from "react";
import { getEmbedInfo } from "@/lib/pdfUtils";
import { ExternalLink, Maximize2, X, FileText, Link as LinkIcon, Loader2, Sparkles } from "lucide-react";

interface MediaPreviewProps {
  pdfUrl?: string;
  workLink?: string;
  pdfTitle?: string;
  workTitle?: string;
  className?: string;
}

export default function MediaPreview({
  pdfUrl,
  workLink,
  pdfTitle = "เอกสาร (PDF)",
  workTitle = "ชิ้นงาน / ผลงาน",
  className = "",
}: MediaPreviewProps) {
  const [activeTab, setActiveTab] = useState<"pdf" | "work">("pdf");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [workLoading, setWorkLoading] = useState(true);

  const pdfEmbed = getEmbedInfo(pdfUrl);
  const workEmbed = getEmbedInfo(workLink);

  const currentEmbed = activeTab === "pdf" ? pdfEmbed : workEmbed;
  const currentRawUrl = activeTab === "pdf" ? pdfUrl : workLink;
  const currentTitle = activeTab === "pdf" ? pdfTitle : workTitle;
  const currentLoading = activeTab === "pdf" ? pdfLoading : workLoading;

  if (!pdfEmbed && !workEmbed) {
    return null;
  }

  return (
    <div className={`mt-6 w-full ${className}`}>
      {/* Tab Switcher if both PDF & Work link exist */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-xl border border-gray-200/60">
          {pdfEmbed && (
            <button
              onClick={() => setActiveTab("pdf")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "pdf"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-600 hover:text-foreground hover:bg-white/50"
              }`}
            >
              <FileText size={16} />
              <span>{pdfTitle}</span>
            </button>
          )}
          {workEmbed && (
            <button
              onClick={() => setActiveTab("work")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "work"
                  ? "bg-white text-accent shadow-sm"
                  : "text-gray-600 hover:text-foreground hover:bg-white/50"
              }`}
            >
              <LinkIcon size={16} />
              <span>{workTitle}</span>
            </button>
          )}
        </div>

        {/* External Quick Link & Fullscreen Controls */}
        <div className="flex items-center gap-2 ml-auto">
          {currentRawUrl && (
            <a
              href={currentRawUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
              title="เปิดดูในแท็บใหม่"
            >
              <span>เปิดดูไฟล์เต็ม</span>
              <ExternalLink size={14} />
            </a>
          )}
          {currentEmbed && (
            <button
              onClick={() => setIsFullScreen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
              title="ขยายเต็มจอ"
            >
              <Maximize2 size={14} />
              <span className="hidden sm:inline">ขยายเต็มจอ</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Iframe Container */}
      <div className="relative w-full h-[480px] md:h-[580px] rounded-2xl overflow-hidden border border-gray-200/80 bg-slate-900/5 shadow-inner">
        {currentLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 backdrop-blur-sm z-10">
            <Loader2 size={40} className="animate-spin text-primary mb-3" />
            <p className="text-sm font-medium text-gray-600">กำลังโหลดตัวอย่างไฟล์ PDF...</p>
            <p className="text-xs text-gray-400 mt-1">กรุณารอสักครู่</p>
          </div>
        )}

        {currentEmbed ? (
          <iframe
            src={currentEmbed.embedUrl}
            className="w-full h-full border-0 rounded-2xl"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            onLoad={() => {
              if (activeTab === "pdf") setPdfLoading(false);
              else setWorkLoading(false);
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
            <FileText size={48} className="mb-2 opacity-40" />
            <p>ไม่พบลิงก์แสดงผลตัวอย่าง</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2 px-1">
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-amber-500" />
          สามารถเลื่อนดูหน้าเอกสารหรือย่อ-ขยายผ่านกรอบพรีวิวได้ทันที
        </span>
        {currentRawUrl && (
          <a
            href={currentRawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline text-primary/80"
          >
            หากพรีวิวไม่ขึ้น คลิกที่นี่เพื่อเปิดดูโดยตรง
          </a>
        )}
      </div>

      {/* Full Screen Modal Overlay */}
      {isFullScreen && currentEmbed && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 text-white">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg md:text-xl truncate max-w-md">
                {currentTitle}
              </h3>
              {currentRawUrl && (
                <a
                  href={currentRawUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-1 text-white"
                >
                  <span>เปิดลิงก์เดิม</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
            <button
              onClick={() => setIsFullScreen(false)}
              className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-colors"
              title="ปิดหน้าจอเต็ม"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 w-full h-full rounded-2xl overflow-hidden bg-white">
            <iframe
              src={currentEmbed.embedUrl}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
