const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
  console.log("Starting Firebase database seeding...");

  // 1. Seed Profile Settings
  await setDoc(doc(db, "settings", "profile"), {
    title: "รายงานการฝึกสอน",
    name: "นางสาวกนกวรรณ ชัยชนะ",
    studentId: "6402041620123",
    department: "เทคโนโลยีคอมพิวเตอร์",
    major: "เทคโนโลยีคอมพิวเตอร์",
    faculty: "ครุศาสตร์อุตสาหกรรม",
    university: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ",
    school: "วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี",
    imageUrl: "/uploads/profile/1.jpg"
  });
  console.log("✓ Profile settings seeded.");

  // 2. Seed School Info
  await setDoc(doc(db, "school", "info"), {
    name: "วิทยาลัยอาชีวศึกษาสุราษฎร์ธานี",
    address: "456/3 ถนนตลาดใหม่ ตำบลตลาด อำเภอเมือง จังหวัดสุราษฎร์ธานี เบอร์โทรศัพท์: 077-282001",
    director: "นายพงษ์ศักดิ์ นุ้ยเจริญ",
    mentor: "นายวิวิต สืบสอน และ นายเมธาสิทธิ์ พลวิธรนันท์",
    logoUrl: "/uploads/school/1.png",
    imageUrl: "/uploads/school/2.webp",
    orgChartUrl: "/uploads/school/3.jpg"
  });
  console.log("✓ School info seeded.");

  // 3. Seed Lessons
  const lessons = [
    {
      title: "แผนการจัดการเรียนรู้ วิชาการสร้างเว็บไซต์",
      subject: "การสร้างเว็บไซต์ (Web Construction)",
      term: 1,
      mentor: "นายวิวิต สืบสอน",
      pdfUrl: "",
      workLink: "",
      createdAt: new Date().toISOString()
    },
    {
      title: "แผนการจัดการเรียนรู้ วิชาคณิตศาสตร์คอมพิวเตอร์",
      subject: "คณิตศาสตร์คอมพิวเตอร์ (Computer Mathematics)",
      term: 2,
      mentor: "นายเมธาสิทธิ์ พลวิธรนันท์",
      pdfUrl: "",
      workLink: "",
      createdAt: new Date().toISOString()
    }
  ];
  for (const lesson of lessons) {
    await addDoc(collection(db, "lessons"), lesson);
  }
  console.log("✓ Lessons seeded.");

  // 4. Seed Research
  await addDoc(collection(db, "researches"), {
    title: "การพัฒนาผลสัมฤทธิ์ทางการเรียนวิชาการสร้างเว็บไซต์ด้วยการเรียนรู้แบบใช้โครงงานเป็นฐาน (Project-Based Learning)",
    pdfUrl: "",
    workLink: "",
    createdAt: new Date().toISOString()
  });
  console.log("✓ Research seeded.");

  // 5. Seed Evaluations
  const evaluations = [
    {
      title: "แบบประเมินผลการจัดการเรียนรู้ ภาคเรียนที่ 1",
      term: 1,
      pdfUrl: "",
      createdAt: new Date().toISOString()
    },
    {
      title: "แบบประเมินผลการจัดการเรียนรู้ ภาคเรียนที่ 2",
      term: 2,
      pdfUrl: "",
      createdAt: new Date().toISOString()
    }
  ];
  for (const evalItem of evaluations) {
    await addDoc(collection(db, "evaluations"), evalItem);
  }
  console.log("✓ Evaluations seeded.");

  // 6. Seed Teaching Logs (Week 1 to 19)
  for (let w = 1; w <= 19; w++) {
    await addDoc(collection(db, "teaching_logs"), {
      term: 1,
      weekNumber: w,
      dateRange: `สัปดาห์ที่ ${w}`,
      activities: [
        { dayName: "จันทร์", activity: "ปฏิบัติหน้าที่การสอนและเตรียมสื่อการเรียนรู้", leaveType: "none", isHoliday: false },
        { dayName: "อังคาร", activity: "ปฏิบัติหน้าที่การสอนและปฐมนิเทศนักเรียน", leaveType: "none", isHoliday: false },
        { dayName: "พุธ", activity: "ปฏิบัติหน้าที่การสอนและตรวจใบงานนักเรียน", leaveType: "none", isHoliday: false },
        { dayName: "พฤหัสบดี", activity: "ปฏิบัติหน้าที่การสอนและดูแลความเรียบร้อย", leaveType: "none", isHoliday: false },
        { dayName: "ศุกร์", activity: "สรุปผลการจัดการเรียนรู้ประจำสัปดาห์", leaveType: "none", isHoliday: false }
      ],
      createdAt: new Date().toISOString()
    });
  }
  console.log("✓ Teaching logs (Week 1-19) seeded.");

  console.log("🎉 All database collections seeded successfully!");
}

seedDatabase().catch(console.error);
