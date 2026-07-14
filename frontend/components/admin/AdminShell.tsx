"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { MaintenanceBanner } from "@/components/admin/MaintenanceBanner";
import type { AuthUser } from "@/types/auth";

interface AdminShellProps {
  user: AuthUser;
  children: React.ReactNode;
  logoUrl?: string;
  siteName?: string;
}

export function AdminShell({
  user,
  children,
  logoUrl = "/logo.png",
  siteName = "Backpackclan",
}: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <div className="hidden lg:flex">
        <AdminSidebar
          user={user}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((prev) => !prev)}
          logoUrl={logoUrl}
          siteName={siteName}
        />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">
            <AdminSidebar
              user={user}
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              mobile
              onNavigate={() => setMobileOpen(false)}
              logoUrl={logoUrl}
              siteName={siteName}
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader user={user} onMenuClick={() => setMobileOpen(true)} />
        <MaintenanceBanner />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
