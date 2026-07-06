"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SeoMetaWithPage } from "@/types/seo";

export function SeoPageList() {
  const [pages, setPages] = useState<SeoMetaWithPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/seo");
      const result = await res.json();
      if (result.success) setPages(result.data);
      else toast.error("Failed to load SEO pages");
    } catch {
      toast.error("Failed to load SEO pages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const filtered = pages.filter(
    (page) =>
      page.label.toLowerCase().includes(search.toLowerCase()) ||
      page.metaTitle.toLowerCase().includes(search.toLowerCase()) ||
      page.path.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSkeleton variant="table" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="SEO Manager"
        description="Manage meta titles, descriptions, and Open Graph settings for all pages."
      />

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search pages..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No pages found"
          description="Try a different search term."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Page
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">
                  Meta Title
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  Robots
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((page) => (
                <tr
                  key={page.pageKey}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-medium">{page.label}</p>
                        <p className="text-xs text-muted-foreground">{page.path}</p>
                      </div>
                      {page.isPlaceholder && (
                        <Badge variant="warning" className="text-[10px]">
                          M3
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="truncate max-w-xs text-muted-foreground">
                      {page.metaTitle}
                    </p>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {page.robots}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/seo/${page.pageKey}`}>
                        <Pencil className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
