const fs = require('fs');
const path = require('path');

function exportLogs() {
  console.log("Exporting local teaching logs to Excel CSV...");

  const baseUploads = path.join(process.cwd(), "public", "uploads", "logs");
  const localImagesMap = {};

  function scanLogsDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanLogsDir(full);
      } else {
        const rel = path.relative(path.join(process.cwd(), "public", "uploads"), full).replace(/\\/g, "/");
        const match = rel.match(/term-(\d+)\/week-(\d+)/);
        if (match) {
          const key = `t${match[1]}_w${match[2]}`;
          if (!localImagesMap[key]) localImagesMap[key] = [];
          localImagesMap[key].push(`/uploads/${rel}`);
        }
      }
    }
  }

  scanLogsDir(baseUploads);

  const rows = [];
  const headers = [
    "ภาคเรียน",
    "สัปดาห์ที่",
    "ช่วงวันที่",
    "กิจกรรมวันจันทร์",
    "กิจกรรมวันอังคาร",
    "กิจกรรมวันพุธ",
    "กิจกรรมวันพฤหัสบดี",
    "กิจกรรมวันศุกร์",
    "จำนวนรูปภาพประกอบ",
    "รายชื่อรูปภาพประกอบ"
  ];

  rows.push(headers);

  // We scan Term 1 & Term 2 for Weeks 1 to 20
  for (let t = 1; t <= 2; t++) {
    for (let w = 1; w <= 20; w++) {
      const key = `t${t}_w${w}`;
      const localImgs = localImagesMap[key] || [];

      // Include all weeks (or those with images/folders)
      const dateRange = `สัปดาห์ที่ ${w}`;
      const row = [
        `ภาคเรียนที่ ${t}`,
        `สัปดาห์ที่ ${w}`,
        dateRange,
        "ปฏิบัติหน้าที่การสอนและเตรียมสื่อการเรียนรู้",
        "ปฏิบัติหน้าที่การสอนและปฐมนิเทศนักเรียน",
        "ปฏิบัติหน้าที่การสอนและตรวจใบงานนักเรียน",
        "ปฏิบัติหน้าที่การสอนและดูแลความเรียบร้อย",
        "สรุปผลการจัดการเรียนรู้ประจำสัปดาห์",
        localImgs.length,
        localImgs.join(" | ")
      ];

      if (localImgs.length > 0 || t === 1) {
        rows.push(row);
      }
    }
  }

  // Generate UTF-8 BOM CSV File (Opens natively in Excel with Thai support)
  const csvContent = "\uFEFF" + rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  
  const publicExportPath = path.join(process.cwd(), "public", "teaching_logs_summary.csv");
  fs.writeFileSync(publicExportPath, csvContent, "utf8");

  console.log(`✅ CSV Excel file created successfully at: ${publicExportPath}`);
  console.log(`Total weekly log records exported: ${rows.length - 1}`);
}

exportLogs();
