import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="mesh-bg"></div>
      <Navbar />
      <main className="flex-grow pt-4">
        {children}
      </main>
      <Footer />
    </>
  );
}
