export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-crimson-600/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-25%] right-[-10%] w-[55%] h-[55%] bg-navy-700/40 rounded-full blur-[130px] pointer-events-none" />
      {children}
    </div>
  );
}
