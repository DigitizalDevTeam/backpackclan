"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export function MaintenanceBanner() {
  const [maintenance, setMaintenance] = useState<{
    enabled: boolean;
    message: string;
  } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings/maintenance-status");
      const result = await res.json();
      if (result.success) setMaintenance(result.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    window.addEventListener("maintenance-updated", fetchStatus);
    return () => window.removeEventListener("maintenance-updated", fetchStatus);
  }, [fetchStatus]);

  if (!maintenance?.enabled) return null;

  return (
    <div className="flex items-center gap-3 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <p>
        <span className="font-semibold">Maintenance mode is ON.</span>{" "}
        {maintenance.message}
      </p>
    </div>
  );
}
