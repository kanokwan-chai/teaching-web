export default function Footer() {
  return (
    <footer className="w-full mt-10 py-4 relative">
      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
      <div className="max-w-6xl mx-auto px-6 flex flex-col items-center justify-center relative z-10">
        <div className="w-12 h-1 bg-gradient-to-r from-primary/50 to-accent/50 rounded-full mb-3"></div>
        <p className="text-xs font-medium text-foreground/60 tracking-wider">
          © {new Date().getFullYear()} Computer Education.
        </p>
      </div>
    </footer>
  );
}
