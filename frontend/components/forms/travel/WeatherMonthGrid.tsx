"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MONTH_NAMES, type WeatherMonth } from "@/types/travel";

interface WeatherMonthGridProps {
  months: WeatherMonth[];
  onChange: (months: WeatherMonth[]) => void;
  disabled?: boolean;
}

function createDefaultMonths(): WeatherMonth[] {
  return MONTH_NAMES.map((_, index) => ({
    month: index + 1,
    avgHigh: null,
    avgLow: null,
    conditions: "",
    note: "",
  }));
}

export function WeatherMonthGrid({
  months,
  onChange,
  disabled = false,
}: WeatherMonthGridProps) {
  const data = months.length === 12 ? months : createDefaultMonths();

  function updateMonth(month: number, patch: Partial<WeatherMonth>) {
    onChange(
      data.map((row) => (row.month === month ? { ...row, ...patch } : row))
    );
  }

  return (
    <div className="space-y-3">
      <Label>Monthly weather</Label>
      <div className="overflow-hidden rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Month
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Avg high (°C)
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Avg low (°C)
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                  Conditions
                </th>
                <th className="px-3 py-2 text-left font-medium text-muted-foreground hidden lg:table-cell">
                  Note
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((row) => (
                <tr key={row.month}>
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {MONTH_NAMES[row.month - 1]}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={row.avgHigh ?? ""}
                      onChange={(e) =>
                        updateMonth(row.month, {
                          avgHigh: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      disabled={disabled}
                      className="w-20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      value={row.avgLow ?? ""}
                      onChange={(e) =>
                        updateMonth(row.month, {
                          avgLow: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      disabled={disabled}
                      className="w-20"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      value={row.conditions}
                      onChange={(e) =>
                        updateMonth(row.month, { conditions: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Sunny, snowy..."
                    />
                  </td>
                  <td className="px-3 py-2 hidden lg:table-cell">
                    <Input
                      value={row.note}
                      onChange={(e) =>
                        updateMonth(row.month, { note: e.target.value })
                      }
                      disabled={disabled}
                      placeholder="Trek suitability, rainfall..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
