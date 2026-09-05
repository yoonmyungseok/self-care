import { Sidebar, MobileNav } from "@/components/layout/Sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <main className="lg:ml-56">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-20 lg:px-8 lg:pb-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
