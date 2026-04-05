import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <MobileNav />
      <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
    </div>
  );
}
